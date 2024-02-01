import { Elysia, InternalServerError, NotFoundError } from "elysia"
import { swagger } from '@elysiajs/swagger'
import { serverTiming } from '@elysiajs/server-timing'
import { staticPlugin } from '@elysiajs/static'
import { Client } from "pg"
import { getRecord, getRecords } from "./utils"
import log from './logger'

const { LEXICON_DB_USER, LEXICON_DB_PWD, LEXICON_DB_HOST, LEXICON_DB_PORT, LEXICON_DB_DATABASE, API_PORT = 80 } = Bun.env

const dbUrl = `postgresql://${LEXICON_DB_USER}:${LEXICON_DB_PWD}@${LEXICON_DB_HOST}:${LEXICON_DB_PORT}/${LEXICON_DB_DATABASE}?sslmode=verify-full`

// create a CockroachDB client
const client = new Client(dbUrl);

await client.connect();

const app = new Elysia()
.use(staticPlugin())
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
.get('/', () => "coucou")
.get("productions", async ({ set, query }) => {
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

.get("/productions/:id", async ({ params: { id }}) => await getRecord(client, 'productions', id))
.listen(API_PORT)

log.debug(
  `API server running at ${app.server?.hostname}:${app.server?.port}`
);

const productions = async (client:Client, offset:any = 0, batch:any = 10, q: any = null) => {
  return await getRecords(client, 'productions', {offset, batch, q})
}
