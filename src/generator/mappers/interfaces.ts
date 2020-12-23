import pluralize from "pluralize";
import { SupportedGraphqls, SupportedOrms } from "../config";
import { TogRelationOptions } from "../decorators";
import { ExtModel, ExtProperty } from "../extractors/extractor-types";
import {
  GenModel,
  GenArg,
  GenInput,
  GenDecorator,
  GenField,
  GenAction,
  GenEmbModel,
} from "../generators/gen-types";
import { mapTsToScalarType } from "../helpers";
import { logger } from "../logger";
import { OrmText } from "../texts/interfaces";
import {
  Action,
  ArgType,
  DecoratorData,
  EmbeddedModel,
  Field,
  InputClasses,
  InputType,
  Model,
} from "./mapper-types";

export abstract class OrmMapper {
  abstract genRelation(opts: TogRelationOptions): DecoratorData[];
  abstract genModelFieldDecorator(field: Field): GenDecorator[];
  abstract genModelDecorator(
    modelName: string,
    uniqueFields: string[],
    embedded?: boolean,
  ): GenDecorator[];
  abstract genInputFieldDecorator(opts: TogRelationOptions): GenDecorator[];
  abstract texts: OrmText;
}

export abstract class GraphqlMapper {
  abstract genModelFieldDecorator(field: Field): GenDecorator[];
  abstract genModelDecorator(
    modelName: string,
    docs?: string,
    input?: boolean,
  ): GenDecorator[];
  abstract genInputFieldDecorator(opts: TogRelationOptions): GenDecorator[];
}

export abstract class Mapper {
  modelsIn: Model[] = [];
  emModelsIn: EmbeddedModel[] = [];
  modelsOut: GenModel[] = [];
  emModelsOut: GenEmbModel[] = [];
  filtersOut: GenInput[] = [];
  ormMapper: OrmMapper;
  graphqlMapper: GraphqlMapper;
  ormType: SupportedOrms;
  graphqlType: SupportedGraphqls;
  
  createEmbModels(): void {
    this.emModelsOut = this.emModelsIn.map<GenEmbModel>(model => {
      const res = new GenEmbModel();
      res.name = model.name;
      res.base = model.base
      res.hasJsonValue = model.hasJsonValue
      res.heritage = model.extends;
      res.fields = model.fields.map<GenField>(field => {
        const resF = new GenField();
        resF.name = field.name;
        resF.docs = field.docs;
        resF.isNullable = field.isNullable;
        resF.type = field.tsType;
        resF.default = field.default;
        resF.decorators.push(
          ...this.ormMapper.genModelFieldDecorator(field),
          ...this.graphqlMapper.genModelFieldDecorator(field),
        );
        return resF;
      });
      res.decorators.push(
        ...this.graphqlMapper.genModelDecorator(model.name, undefined, true),
        ...this.ormMapper.genModelDecorator(
          model.name,
          model.uniqueFields,
          true,
        ),
      );
      return res;
    });
  }

  createModels(): void {
    this.modelsOut = this.modelsIn.map<GenModel>(model => {
      const res = new GenModel();
      res.name = model.name;
      res.hasJsonValue = model.hasJsonValue
      res.heritage = model.extends;
      res.docs = model.docs.model;
      res.fields = model.fields.map<GenField>(field => {
        const resF = new GenField();
        resF.name = field.name;
        resF.docs = field.docs;
        resF.isNullable = field.isNullable;
        resF.type = field.tsType;
        resF.default = field.default;
        resF.decorators.push(
          ...this.ormMapper.genModelFieldDecorator(field),
          ...this.graphqlMapper.genModelFieldDecorator(field),
          ...field.decorators.map(v => ({
            name: v.name,
            arguments: [v.text || ""],
          })),
        );
        return resF;
      });
      res.decorators.push(
        ...this.graphqlMapper.genModelDecorator(model.name, model.docs.model),
        ...this.ormMapper.genModelDecorator(model.name, model.uniqueFields),
        ...model.decorators.map(v => ({
          name: v.name,
          arguments: [v.text || ""],
        })),
      );
      res.action = this.createActions(
        model.actions,
        model.name,
        model.resolverName,
        model.docs.resolvers?.resolver,
      );
      res.inputs = this.createInputs(model.inputs);
      res.args = this.createArgs(model.args);
      return res;
    });
  }

  createArgs(args: ArgType[]): GenArg[] {
    return args.map<GenArg>(argType => {
      const res = new GenArg();
      res.name = argType.name;
      res.docs = argType.docs;
      res.inputs = argType.args
        .filter(v => v.isInput)
        .map<string>(v => v.tsType);
      res.decorators.push({
        name: "ArgsType",
        arguments: [],
      });
      res.fields = argType.args.map<GenField>(field => {
        const resF = new GenField();
        resF.name = field.name;
        resF.type = field.tsType;
        resF.docs = field.comment;
        resF.isNullable = field.isNullable;
        resF.decorators.push({
          name: "Field",
          arguments: [
            `_type => ${field.graphqlType}`,
            `{ nullable: ${field.isNullable} }`,
          ],
        });
        return resF;
      });
      return res;
    });
  }

  createInputs(inputs: InputType[]): GenInput[] {
    return inputs.map<GenInput>(inputType => {
      const res = new GenInput();
      res.name = inputType.typeName;
      res.hasJsonValue = inputType.hasJsonValue;
      res.docs = inputType.docs;
      res.decorators.push({
        name: "InputType",
        arguments: [
          `{
              isAbstract: true,
              description: ${
                inputType.docs ? `"${inputType.docs}"` : undefined
              },
            }`,
        ],
      });
      res.fields = inputType.fields.map<GenField>(field => {
        const resF = new GenField();
        resF.docs = field.docs;
        resF.isNullable = field.isNullable;
        resF.name = field.name;
        resF.type = field.tsType;
        if (["Create", "Update", "WhereUnique"].includes(inputType.type)) {
          resF.decorators.push(
            ...field.validations.map(v => ({
                name: v.name,
                arguments: v.text ? [v.text] : [""],
              })),
          )
        }
        resF.decorators.push(
          {
            name: "Field",
            arguments: [
              [
                `_type => ${field.graphqlType},`,
                `{`,
                `nullable: ${field.isNullable},`,
                `description: ${field.docs ? `"${field.docs}"` : undefined}`,
                `}`,
              ].join(" "),
            ],
          },
        );
        return resF;
      });
      return res;
    });
  }

  createActions(
    actions: Action[],
    modelName: string,
    modelResolverName: string,
    docs?: string,
  ): GenAction {
      const res = new GenAction();
      res.docs = docs;
      res.name = modelResolverName;
      res.modelName = modelName;
      res.args = Array.from(
        new Set(
          actions
            .filter(it => it.argsTypeName !== undefined)
            .map(it => it.argsTypeName!),
        ),
      );
      res.decorators.push({
        name: "Resolver",
        arguments: [`_of => ${modelName}`],
      });
      res.methods = actions.map(action => ({
        name: action.name,
        isAsync: true,
        returnType: `Promise<${action.returnTSType}>`,
        decorators: [
          ...(action.middlewares
            ? [
                {
                  name: "UseMiddleware",
                  arguments: action.middlewares,
                },
              ]
            : []),
          {
            name: `${action.operation}`,
            arguments: [
              [
                `_returns => ${action.typeGraphQLType},`,
                `{`,
                `nullable: ${!action},`,
                `description: ${action.docs ? action.docs : "undefined"}`,
                `}`,
              ].join(" "),
            ],
          },
        ],
        parameters: [
          {
            name: "ctx",
            type: "GraphqlContext",
            decorators: [{ name: "Ctx", arguments: [] }],
          },
          ...(!action.argsTypeName
            ? []
            : [
                {
                  name: "args",
                  type: action.argsTypeName,
                  decorators: [{ name: "Args", arguments: [] }],
                },
              ]),
        ],
        statements: action.body,
      }));
      return res;
  }

  map() {
    this.createEmbModels();
    this.createModels();
  }

  filterClass(models: ExtModel[], validNames: string[], replace: string = "Tog"): ExtModel[] {
    return models.filter(v => {
      let res = false;
      v.decorators.forEach(v2 => {
        if (validNames.includes(v2.name)) {
          res = true;
        }
      });
      return res;
    }).map(v => {
      v.name = v.name.replace(replace, "")
      return v
    });
  }

  filterFields(
    model: ExtModel,
    validNames: string[],
    replace: string = "Tog",
  ): ExtProperty[] {
    return model.properties
      .filter(v => {
        let res = false;
        v.decorators.forEach(v2 => {
          if (validNames[v2.name] === undefined) {
            res = true;
          }
        });
        return res;
      })
      .map<ExtProperty>(field => {
        replace
          ? (field.type.refType = field.type.refType?.replace(replace, ""))
          : undefined;
        if (field.type.type === "Union") {
          logger.warn(
            `choose ${field.type.union[0].type} for ${field.name} field (cant generate for unions)`,
          );
          field.type.type = field.type.union[0].type;
          field.type.union[0].refType
            ? (field.type.refType = field.type.union[0].refType)
            : undefined;
        }
        return field;
      });
  }

  addModelName(res: Model, model: ExtModel) {
    if (res.name === "Metadata") {
      pluralize.addSingularRule(/metadata/g, "metadata");
    }
    if (!pluralize.isPlural(model.name)) {
      res.name = model.name;
      res.resolverName = `${model.name}CrudResolver`;
      res.plural = pluralize.plural(model.name);
    } else if (pluralize.isPlural(model.name)) {
      res.plural = model.name;
      res.name = pluralize.singular(model.name);
      logger.warn(`Change Plural Model Name ${res.plural} to ${res.name}`);
    }
  }

  getPropertyType(field: ExtProperty, isFloat: boolean, isList: boolean) {
    let tsType = "";
    let graphqlType = "";
    if (field.type.type === "TypeReference" || field.type.type === "enum") {
      tsType = field.type.refType!;
      graphqlType = field.type.refType!;
    } else if (field.type.type === "Union") {
      tsType = field.type.union!.map(v => v.type).join(" | ");
      graphqlType = mapTsToScalarType(field.type.union![0].type);
    } else if (field.type.type === "null" || field.type.type === "undefined") {
      tsType = "string";
      graphqlType = "String";
      logger.warn("null and undifiend are invalid types (changed to string)");
    } else {
      tsType = field.type.type;
      graphqlType = mapTsToScalarType(field.type.type, isFloat);
    }

    if (isList) {
      tsType = tsType + "[]";
      graphqlType = "[" + graphqlType + "]";
    }
    return { tsType, graphqlType };
  }
}
