import { pascalCase } from "change-case";
import { SupportedOrms } from "../config";
import { TogFieldOptions, TogOptions, TogRelationOptions } from "../decorators";
import { ExtData, ExtModel, ExtProperty } from "../extractors/extractor-types";
import { icuEmbeddedModels } from "./embeddedModels";
import { pushListUnique } from "./helpers";
import { Mapper } from "./interfaces";
import {
  createActions,
  createArgTypes,
  createInputTypes,
} from "./map-components";
import { createMikroOrmFilters } from "./map-filter-mikro-orm";
import { createTypeOrmFilters } from "./map-filters-typeorm";
import {
  CrudMiddleware,
  EmbeddedModel,
  Field,
  InputClasses,
  Model,
  ModelDocs,
} from "./mapper-types";
import { MikroOrmMapper } from "./mikroorm";
import { TypeGraphqlMapper } from "./typegraphql";
import { TypeOrmMapper } from "./typeorm";

export class MapperTog extends Mapper {
  validationDecr: string[] = [];

  constructor(data: ExtData, type: SupportedOrms) {
    super();
    this.ormType = type;
    this.graphqlType = "TypeGraphql";
    this.graphqlMapper = new TypeGraphqlMapper()
    type === "MikroOrm"
      ? (this.ormMapper = new MikroOrmMapper())
      : (this.ormMapper = new TypeOrmMapper());
    data.imports
      .filter(v => v.moduleName === "class-validator")
      .forEach(v => {
        this.validationDecr.push(...v.namedImports, v.defaultImport || "");
      });

    this.emModelsIn.push(...this.genEmbeddedModels(data.models));
    
    for (const model of this.filterClass(data.models, ["Tog"])) {
      const res = new Model();

      this.addModelName(res, model);
      for (const decr of model.decorators) {
        if (decr.name === "Tog") {
          if (decr.properties[0]) {
            const togOpts = decr.properties[0] as TogOptions;
            this.addOptionsForModel(res, togOpts);
          }
        }
      }
      model.properties = this.filterFields(model, [
        "TogField",
        "TogRelationField",
      ]);
      this.createFields(res, model);
      const inputFields = [...res.fields]
      console.log(res.extends)
      this.emModelsIn.filter(v => res.extends === v.name).forEach(model => {
        inputFields.push(...model.fields)
      })
      res.inputs.push(...createInputTypes(res.name, inputFields, res.docs, this.ormType));
      res.args.push(...createArgTypes(res.name, res.docs));
      res.actions.push(
        ...createActions(
          res.name,
          res.plural,
          res.middlewares,
          res.docs,
          this.ormMapper.texts,
        ),
      );
      pushListUnique(this.modelsIn, res);
    }
    this.map()
  }

  createFilters(enums: string[]): void {
    this.filtersOut = this.ormType === "MikroOrm" ? createMikroOrmFilters(enums,
      this.emModelsOut.filter(v => {
        if (v.base) {
          return false
        }
        return true
      }).map<string>(model => model.name)) : createTypeOrmFilters(enums)
  }

  genEmbeddedModels(models: ExtModel[]): EmbeddedModel[] {
    const embRes = this.filterClass(models, ["TogEmbedded"]).map<EmbeddedModel>(
      model => {
        const res = new EmbeddedModel();
        res.name = model.name.replace("Tog", "");
        model.properties = this.filterFields(model, [
          "TogField",
          "TogRelationField",
        ]);
        this.createFields(res, model);
        return res;
      },
    );
    embRes.push(...icuEmbeddedModels(this.ormMapper.texts));
    return embRes;
  }

  createFields(model: Model | EmbeddedModel, rawModel: ExtModel) {
    let idField: string = "";
    const embModels: [string, string][] = [["extend", model.extends]];

    for (const field of rawModel.properties) {
      const getField = this.createField(field);
      getField.field.isEmbedded
        ? embModels.push([
            getField.field.name,
            getField.field.tsType.replace("[]", ""),
          ])
        : undefined;
      getField.isId ? (idField = getField.field.name) : undefined;
      if (field.type.type === "JsonValue") {
        model.hasJsonValue = true;
      }
      model.fields.push(getField.field);
      if (getField.indexed) {
        model.indexedFields.push(getField.field.name);
      }
      if (getField.isEnum) {
        model.enumFields.push(getField.field.name);
      }
      if (getField.unique) {
        model.uniqueFields.push(getField.field.name);
      }
    }
    model.idField = idField;
    embModels.forEach(v => {
      const emModel = this.emModelsIn.find(lv => lv.name === v[1]);
      if (emModel) {
        model.uniqueFields.push(...emModel.uniqueFields);
        if (model instanceof Model) {
          model.embeddedFields.push(
            ...emModel.fields.map(lv => {
              const res = { ...lv };
              if (v[0] === "extend") {
                return res;
              }
              res.name = `${v[0]}${pascalCase(lv.name)}`;
              return res;
            }),
          );
        }
        if (model.idField === "") {
          emModel.idField ? (model.idField = emModel.idField) : undefined;
        }
      }
    });
  }

  createField(field: ExtProperty) {
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
          isId = togOpts.type === "pk" ? true : false;
          fieldRes.isEmbedded = togOpts.type === "embedded" ? true : false;
        }
      }
      if (decr.name === "TogRelationField") {
        const relOpts = decr.properties[0] as TogRelationOptions;
        this.addOptionsForRelation(fieldRes, relOpts);
      }
      if (this.validationDecr.includes(decr.name)) {
        fieldRes.decorators.push({ name: decr.name, text: decr.propText });
      }
    }
    const types = this.getPropertyType(field, isFloat, fieldRes.isList);
    fieldRes.tsType = types.tsType;
    fieldRes.graphqlType = types.graphqlType;
    return { field: fieldRes, indexed, unique, isEnum, isId };
  }

  addOptionsForModel(res: Model, togOpts: TogOptions) {
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

  addOptionsForRelation(fieldRes: Field, relOpts: TogRelationOptions) {
    fieldRes.isOmitted = [
      InputClasses.create,
      InputClasses.orderBy,
      InputClasses.update,
      InputClasses.whereUnique,
      InputClasses.where,
    ];
    const resRels = this.ormMapper.genRelation(relOpts);
    fieldRes.diffOrmDecorator = resRels[0];
    const otherDecrs = resRels.reverse();
    otherDecrs.pop();
    fieldRes.decorators.push(...otherDecrs);
  }
}
