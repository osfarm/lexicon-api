import { Elysia } from "elysia";
import { swagger } from '@elysiajs/swagger'
import { Client } from "pg"
import { getRecords } from "./utils";

const { LEXICON_DB_USER, LEXICON_DB_PWD, LEXICON_DB_HOST, LEXICON_DB_PORT, LEXICON_DB_DATABASE, API_PORT = 80 } = Bun.env

const dbUrl = `postgresql://${LEXICON_DB_USER}:${LEXICON_DB_PWD}@${LEXICON_DB_HOST}:${LEXICON_DB_PORT}/${LEXICON_DB_DATABASE}?sslmode=verify-full`

// create a CockroachDB client
const client = new Client(dbUrl);

await client.connect();
//await client.query(`SET search_path = 'public'`)

const app = new Elysia()
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
.get("productions", async ({ set, query }) => {
  set.headers['content-type'] = 'application/json';
  try {
  const data = await productions(client, query.offset, query.batch, query.q)
  set.status = data === null ? 404 : 200
  return data
  } catch (e) {
    set.status = 500
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
