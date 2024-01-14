import { Elysia } from "elysia";
import { Client } from "pg"

const { LEXICON_DB_USER, LEXICON_DB_PWD, LEXICON_DB_HOST, LEXICON_DB_PORT, LEXICON_DB_DATABASE } = Bun.env

const dbUrl = `postgresql://${LEXICON_DB_USER}:${LEXICON_DB_PWD}@${LEXICON_DB_HOST}:${LEXICON_DB_PORT}/${LEXICON_DB_DATABASE}?sslmode=verify-full`

const client = new Client(dbUrl);

const app = new Elysia()
.get("/:collection/:id", async ({ params: { collection, id }}) => await getRecord(collection, id))
.get("/:collection/", async ({ params: { collection }}) => await getRecords(collection))
.listen(3003)

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

const getRecord = async (collection: string, id: string): Promise<any> => {
    await client.connect();
    try {
      const results = await client.query(`SELECT * FROM public.master_${collection} WHERE reference_name='${id}'`);
      if (results.rows.length === 0) {
        return {}
      }
      return results.rows[0]
    } catch (err) {
      console.error("error executing query:", err);
    } finally {
      client.end();
    }
}

const getRecords = async (collection: string): Promise<any> => {
  await client.connect();
  try {
    const results = await client.query(`SELECT * FROM public.master_${collection} LIMIT 10`);
    if (results.rows.length === 0) {
      return {}
    }
    return results.rows
  } catch (err) {
    console.error("error executing query:", err);
  } finally {
    client.end();
  }
}
