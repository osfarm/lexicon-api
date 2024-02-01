import { Elysia, InternalServerError, NotFoundError } from "elysia"
import { bearer } from '@elysiajs/bearer'
import { swagger } from '@elysiajs/swagger'
import { serverTiming } from '@elysiajs/server-timing'
import { Client } from "pg"
import { getRecords } from "./utils"

const { LEXICON_DB_USER, LEXICON_DB_PWD, LEXICON_DB_HOST, LEXICON_DB_PORT, LEXICON_DB_DATABASE, API_PORT = 80 } = Bun.env

const dbUrl = `postgresql://${LEXICON_DB_USER}:${LEXICON_DB_PWD}@${LEXICON_DB_HOST}:${LEXICON_DB_PORT}/${LEXICON_DB_DATABASE}?sslmode=verify-full`

// create a CockroachDB client
const client = new Client(dbUrl);

await client.connect();
//await client.query(`SET search_path = 'public'`)

const app = new Elysia()
.use(bearer())
.use(serverTiming())
.use(swagger({
  documentation: {
      info: {
          title: 'Lexicon Documentation',
          version: '1.0.0'
      },
      tags: [
        { name: 'App', description: 'General endpoints' },
        { name: 'References', description: 'References endpoints' }
      ]
  }
}))
.onError(({ code, error, set }) => {
  if (code === 'NOT_FOUND') {
      set.status = 404
      return 'Not Found :('
  }
})
.get("productions", async ({ bearer, set, query }) => {
  if (!query.apikey) {
    set.status = 401
    set.headers[
        'WWW-Authenticate'
    ] = `Bearer realm='sign', error="invalid_request"`

    return 'Unauthorized'
  }
  set.headers['content-type'] = 'application/json';
  try {
  const data = await productions(client, query.offset, query.batch, query.q)
  if (data === null) {
    throw new NotFoundError()
  }

  return data

  } catch (e) {
    throw new InternalServerError((e as Error).message)
  }
}, {
  detail: {
    tags: ['References']
  }})

.get("/productions/:id", async ({ params: { id }}) => await getRecord('productions', id))
.listen(API_PORT)

console.log(
  `API server running at ${app.server?.hostname}:${app.server?.port}`
);

const productions = async (client:Client, offset:any = 0, batch:any = 10, q: any = null) => {
  return await getRecords(client, 'productions', {offset, batch, q})
}
