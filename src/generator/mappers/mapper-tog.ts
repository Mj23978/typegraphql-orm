import {
  addModelName,
  addOptionsForModel,
  addOptionsForRelation,
  getPropertyType,
  pushListUnique,
} from "./helpers";
import { ExtData, ExtModel, ExtProperty } from "../extractors/extractor-types";
import { TogFieldOptions, TogOptions, TogRelationOptions } from '../decorators';
import {
  Model,
  Field,
  EmbeddedModel,
} from "./mapper-types";
import { embeddedModels } from './embeddedModels';
import { SupportedOrms } from '../config';


export function mapperTog(data: ExtData, type: SupportedOrms): { models: Model[]; embeddedModels: EmbeddedModel[]} {
  const models: Model[] = [];
  const embeddedModels: EmbeddedModel[] = [];
  const validationDecr: string[] = [];

  data.imports
    .filter(v => v.moduleName === "class-validator")
    .forEach(v => {
      validationDecr.push(...v.namedImports, v.defaultImport || "");
    });

  embeddedModels.push(...embeddedModelsForTog(data.models, type, validationDecr));
  data.models = filterModelsForTog(data.models);

  // Get Class Name, Decorators, Fields Metadata
  for (const model of data.models) {
    const res = new Model();
    addModelName(res, model)

    // Get Tog Decorator Metadata
    for (const decr of model.decorators) {
      if (decr.name === "Tog") {
        if (decr.properties[0]) {
          const togOpts = decr.properties[0] as TogOptions;
          addOptionsForModel(res, togOpts);
        }
      }
    }

    model.properties = filterFieldsForTog(model);
    let idField: string = "";

    // Get TogFields Metadata
    for (const field of model.properties) {
      const getField = createFieldForMapper(field, validationDecr, type)
      getField.isId ? idField = getField.field.name : undefined
      if (field.type.type === "JsonValue") {
        res.hasJsonValue = true;
      }
      res.fields.push(getField.field);
      if (getField.indexed) {
        res.indexedFields.push(getField.field.name);
      }
      if (getField.isEnum) {
        res.enumFields.push(getField.field.name);
      }
      if (getField.unique) {
        res.uniqueFields.push(getField.field.name);
      }
    }
    res.idField = idField;
    pushListUnique(models, res);
  }
  return { models, embeddedModels };
}


export function filterModelsForTog(models: ExtModel[]): ExtModel[] {
  return models
    .filter(v => {
      const validNames = ["Tog"];
      let res = false;
      v.decorators.forEach(v2 => {
        if (validNames.includes(v2.name)) {
          res = true;
        }
      });
      return res;
    })
    .map<ExtModel>(model => {
      model.name = model.name.replace("Tog", "");
      return model;
    });
}


export function embeddedModelsForTog(models: ExtModel[], type: SupportedOrms, validationDecr): EmbeddedModel[] {
  const embRes = models
    .filter(v => {
      const validNames = ["TogEmbedded"];
      let res = false;
      v.decorators.forEach(v2 => {
        if (validNames.includes(v2.name)) {
          res = true;
        }
      });
      return res;
    })
    .map<EmbeddedModel>(model => {
      const res = new EmbeddedModel()
      res.name = model.name.replace("Tog", "")
      model.properties = filterFieldsForTog(model);
      let idField: string = "";

      for (const field of model.properties) {
        const getField = createFieldForMapper(field, validationDecr, type);
        getField.isId ? (idField = getField.field.name) : undefined;
        if (field.type.type === "JsonValue") {
          res.hasJsonValue = true;
        }
        res.fields.push(getField.field);
        if (getField.indexed) {
          res.indexedFields.push(getField.field.name);
        }
        if (getField.isEnum) {
          res.enumFields.push(getField.field.name);
        }
        if (getField.unique) {
          res.uniqueFields.push(getField.field.name);
        }
      }
      res.idField = idField;

      return res;
    });
  embRes.push(...embeddedModels(type))
  return embRes
}


export function filterFieldsForTog(model: ExtModel): ExtProperty[] {
  return model.properties.filter(v => {
    const validNames = ["TogField", "TogRelationField"];
    let res = false;
    v.decorators.forEach(v2 => {
      if (validNames[v2.name] === undefined) {
        res = true;
      }
    });
    return res;
  }).map<ExtProperty>(field => {
    field.type.refType = field.type.refType?.replace("Tog", "");
    if (field.type.type === "Union") {
      console.log(
        `Warning : choose ${field.type.union[0].type} for ${field.name} field (cant generate for unions)`,
      );
      field.type.type = field.type.union[0].type;
      field.type.union[0].refType
        ? (field.type.refType = field.type.union[0].refType)
        : undefined;
    }
    return field;
  });
}


function createFieldForMapper(field: ExtProperty, validationDecr: any[], type: SupportedOrms) {
  const fieldRes = new Field();
  fieldRes.name = field.name;
  fieldRes.isNullable = field.isNullable;
  fieldRes.isList = field.isList;
  let indexed = false;
  let unique = false;
  let isEnum = false;
  let isFloat = false;
  let isId = false;
  // Get Field Decorators Metadata
  for (const decr of field.decorators) {
    if (decr.name === "TogField") {
      if (decr.properties[0]) {
        const togOpts = decr.properties[0] as TogFieldOptions;
        fieldRes.default = togOpts.default;
        fieldRes.alias = togOpts.alias;
        fieldRes.docs = togOpts.docs;
        fieldRes.decorators.push(...(togOpts.decorators || []));
        fieldRes.isOmitted = togOpts.exclude;
        fieldRes.excludeFrom = togOpts.hidden;
        indexed = togOpts.index ? togOpts.index : false;
        unique = togOpts.unique ? togOpts.unique : false;
        fieldRes.isUnique = unique;
        fieldRes.isIndex = indexed;
        isEnum = togOpts.type === "enum" ? true : false;
        isFloat = togOpts.type === "float" ? true : false;
        fieldRes.isEnum = isEnum;
        fieldRes.isFloat = isFloat;
        isId = togOpts.type === "pk" ? true : false
        fieldRes.isEmbedded = togOpts.type === "embedded" ? true : false
      }
    }
    if (decr.name === "TogRelationField") {
      const relOpts = decr.properties[0] as TogRelationOptions;
      addOptionsForRelation(fieldRes, relOpts, type);
    }
    if (validationDecr.includes(decr.name)) {
      fieldRes.decorators.push({ name: decr.name, text: decr.propText });
    }
  }
  const types = getPropertyType(field, isFloat, fieldRes.isList);
  fieldRes.tsType = types.tsType;
  fieldRes.graphqlType = types.graphqlType;
  return { field: fieldRes, indexed, unique, isEnum, isFloat, isId }
}