import { Client } from "pg";
import { MapType, QueryType } from "./types";

export const getRecord = async (client: Client, collection: string, id: string): Promise<any> => {
  try {
    const results = await client.query(`SELECT * FROM public.master_${collection} WHERE reference_name='${id}'`);
    if (results.rows.length === 0) {
      return {}
    }
    return results.rows[0]
  } catch (err) {
    console.error("error executing query:", err);
  }
}

const productionsMap: MapType = { hideEmpties: true, ignored: ['id','color', 'translation_id', 'started_on', 'stopped_on'], renamed: { reference_name: 'id', fra: 'name_fr', eng: 'name_en'}}

export const getRecords = async (client: Client, collection: string, qs: QueryType): Promise<any> => {
  try {
    const { offset = 0, batch = 10, q = null } = qs
    const translations = `public.master_translations`
    const table = `public.master_${collection}`
    let baseQuery = `SELECT * FROM ${table} `
    baseQuery += `LEFT JOIN ${translations} ON ${table}.translation_id = ${translations}.id `
    if (q !== null) {
      baseQuery += `WHERE reference_name LIKE '%${qs.q}%' `
    }
    const query = `${baseQuery} LIMIT ${batch} OFFSET ${offset}`
    console.log(`Executing query ${query}`);
    const results = await client.query(query);
    if (results.rows.length === 0) {
      return null
    }
    const count = await client.query(baseQuery.replace('*', 'COUNT(*) AS total'));
    const max = parseInt(count.rows[0].total)
    return { data: parseRows(results.rows, productionsMap), offset, batch, q, total: results.rowCount, max }
  } catch (err) {
    console.error("error executing query: ", err);
    throw new Error()
  }
}

const parseRows = (rows: any[], map: MapType = {}) => {
  const { hideEmpties = false, ignored = [], required, renamed = {}} = map
  const processedRows: any[] = []
  rows.forEach(row => {
    const processRow:any = {}
    Object.keys(row).forEach((key: string) => {

      if (ignored.includes(key) || (row[key] === "" && hideEmpties === true)) {
        return
      }
      if (Reflect.has(renamed, key)) {
        processRow[renamed[key]] = row[key]
      } else if ((required && required.includes(key)) || ! required) {
        processRow[key] = row[key]
      }
    })
    processedRows.push(processRow)
  });

  return processedRows
}
