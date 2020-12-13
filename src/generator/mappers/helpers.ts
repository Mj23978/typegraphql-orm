import { ExtModel, ExtProperty } from '../extractors/extractor-types';
import { mapTsToScalarType } from '../helpers';
import {
  CrudMiddleware,
  Field,
  InputClasses,
  Model,
  ModelDocs,
} from "./mapper-types";
import pluralize from "pluralize";
import { TogFieldOptions, TogOptions, TogRelationOptions } from '../decorators';
import { typeOrmRelation } from './typeorm';
import { SupportedOrms } from '../config';
import { mikroOrmRelation } from './mikroorm';

export function pushListUnique<T>(list: T[], item: T) {
  const found = list.find(v => v === item);
  if (found === undefined) {
    list.push(item);
  }
}

export function getPropertyType(field: ExtProperty, isFloat: boolean, isList: boolean) {
  // Get Field Types Metadata
  let tsType = ""
  let graphqlType = ""
  if (field.type.type === "TypeReference" || field.type.type === "enum") {
    tsType = field.type.refType!;
    graphqlType = field.type.refType!;
  } else if (field.type.type === "Union") {
    tsType = field.type.union!.map(v => v.type).join(" | ");
    graphqlType = mapTsToScalarType(field.type.union![0].type);
  } else if (field.type.type === "null" || field.type.type === "undefined") {
    tsType = "string";
    graphqlType = "String";
    console.log(
      "Warning : null and undifiend are invalid types (changed to string)",
    );
  } else {
    tsType = field.type.type;
    graphqlType = mapTsToScalarType(field.type.type, isFloat);
  }

  if (isList) {
    tsType = tsType + "[]";
    graphqlType = "[" + graphqlType + "]";
  }
  return { tsType, graphqlType }
}


export function addModelName(res: Model, model: ExtModel) {
  if (res.name === "Metadata") {
    pluralize.addSingularRule(/metadata/g, "metadata")
  }
  if (!pluralize.isPlural(model.name)) {
    res.name = model.name;
    res.resolverName = `${model.name}CrudResolver`;
    res.plural = pluralize.plural(model.name);
  }
  if (pluralize.isPlural(model.name)) {
    res.plural = model.name;
    res.name = pluralize.singular(model.name);
    console.log(
      `Warning : Change Plural Model Name ${res.plural} to ${res.name}`,
    );
  }
}


export function addOptionsForModel(res: Model, togOpts: TogOptions) {
  res.alias = togOpts.alias;
  res.decorators.push(...(togOpts.decorators || []));
  res.docs = togOpts.docs || new ModelDocs();
  res.middlewares = togOpts.middlewares || new CrudMiddleware();
  if (togOpts.createdAt) {
    if (togOpts.updatedAt) {
      if (togOpts.id) {
        res.extends = "TogBaseICU";
      } else {
        res.extends = "TogBaseCU";
      }
    } else if (togOpts.id) {
      res.extends = "TogBaseIC";
    } else {
      res.extends = "TogBaseC";
    }
  } else if (togOpts.updatedAt) {
    if (togOpts.id) {
      res.extends = "TogBaseIU";
    } else {
      res.extends = "TogBaseU";
    }
  } else if (togOpts.id) {
    res.extends = "TogBaseI";
  } else {
    res.extends = "TogBase";
  }
}

export function addOptionsForRelation(fieldRes: Field, relOpts: TogRelationOptions, type: SupportedOrms) {
  fieldRes.isOmitted = [
    InputClasses.create,
    InputClasses.orderBy,
    InputClasses.update,
    InputClasses.whereUnique,
    InputClasses.where,
  ];
  const resRels = type === "TypeOrm" ? typeOrmRelation(relOpts) : mikroOrmRelation(relOpts);
  fieldRes.diffOrmDecorator = resRels[0];
  const otherDecrs = resRels.reverse();
  otherDecrs.pop();
  fieldRes.decorators.push(...otherDecrs);
}