export type QueryType = {
  offset?: number,
  batch?: number,
  q?: string
}

export type MapType = {
  ignored?: string[],
  required?: string[],
  renamed?: { [x:string]: string }
  hideEmpties?: boolean
}