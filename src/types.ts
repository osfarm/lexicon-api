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

export const CREATE = 'CREATE'
export const READ = 'READ'
export const UPDATE = 'UPDATE'
export const DELETE = 'DELETE'
export const LIST = 'LIST'

export type Methods = typeof CREATE | typeof READ | typeof UPDATE | typeof DELETE | typeof LIST

export type endpointDefinition = {
  collection: string
  methods: Array<Methods>
  map?: MapType
}