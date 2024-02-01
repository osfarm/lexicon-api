import { endpointDefinition } from "./types";

export const endpoints: { [key: string] : endpointDefinition } = {
  productions: {
    collection: 'master_productions',
    methods: ['LIST', 'READ'],
    map: {
      hideEmpties: true,
      ignored: ['id','color', 'translation_id', 'started_on', 'stopped_on'],
      renamed: {
        reference_name: 'id',
        fra: 'name_fr',
        eng: 'name_en'
      }
    }
  }
}