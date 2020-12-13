import { pushListUnique } from './helpers';
import { ExtData } from "../extractors/extractor-types";

export function createModelsFromTypeorm(data: ExtData) {
  const modelNames: string[] = [];
  const decorators: string[] = [];
  const uniqueFields: string[] = [];
  const customTypes: string[] = [];
  let extendsBaseEntity = false;

  data.models = data.models.filter(v => {
    const validNames = ["ObjectType", "Entity"];
    let res = false;
    v.decorators.forEach(v2 => {
      if (validNames[v2.name] === undefined) {
        res = true;
      }
    });
    return res;
  });
  // Get Class Name, Decorators, Fields Metadata
  for (const model of data.models) {
    pushListUnique(modelNames, model.name);
    // Get Decorators Metadata
    for (const decr of model.decorators) {
      pushListUnique(decorators, decr.name);
      if (decr.name === "Unique") {
        decr.properties.forEach(v => {
          if (Array.isArray(v)) {
            if (v.length === 1) {
              uniqueFields.push(v[0]);
            }
          }
        });
      }
    }
    if (model.heritages.includes("extends BaseEntity")) {
      extendsBaseEntity = true;
    }
    // Get Fields Metadata
    for (const field of model.properties) {
      // Get Field Decorators Metadata
      for (const decr of field.decorators) {
        if (decr.name === "Index") {
          if (decr.properties.length === 1) {
            const map = decr.properties[0] as Map<string, any>;
            if (map.has("unique") && map.get("unique") === true) {
              uniqueFields.push(field.name);
            }
          }
        }
      }
      // Get Field Types Metadata
      if (field.type.type === "TypeReference") {
        customTypes.push(field.type.refType!);
      }
    }
  }
  console.log(modelNames);
  console.log(decorators);
  console.log(uniqueFields);
  console.log(extendsBaseEntity);
  console.log(customTypes);
}
