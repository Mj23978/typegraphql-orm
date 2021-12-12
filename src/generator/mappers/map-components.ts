import { replacOrmMessageTokens } from "../../utils/message";
import { mapTsToWhereType } from "../helpers";
import { TypeOrmText } from "../texts/typeorm";
import {
  Action,
  ArgType,
  CrudMiddleware,
  ExcludeFieldFrom,
  Field,
  inputClasses,
  InputClasses,
  InputField,
  InputType,
  Model,
  ModelAction,
  modelActions,
  ModelDocs,
} from "./mapper-types";
import { SupportedOrms } from "../config";
import { MikroOrmText } from "../texts/mikro-orm";
import { OrmText } from "../texts/interfaces";

export function createArgTypes(
  modelName: string,
  modelDocs: ModelDocs,
): ArgType[] {
  const args: ArgType[] = [];

  const whereArgField = {
    tsType: `${modelName}WhereInput`,
    isList: false,
    name: "where",
    isInput: true,
    graphqlType: `${modelName}WhereInput`,
    isNullable: true,
  };
  const orderByArgField = {
    tsType: `${modelName}OrderByInput`,
    isList: false,
    name: "orderBy",
    isInput: true,
    graphqlType: `${modelName}OrderByInput`,
    isNullable: true,
  };
  const cursorArgField = {
    tsType: `${modelName}WhereUniqueInput`,
    isList: false,
    isInput: true,
    name: "cursor",
    graphqlType: `${modelName}WhereUniqueInput`,
    isNullable: true,
  };
  const whereUniqueArgField = {
    tsType: `${modelName}WhereUniqueInput`,
    isList: false,
    isInput: true,
    name: "where",
    graphqlType: `${modelName}WhereUniqueInput`,
    isNullable: true,
  };
  const takeArgField = {
    tsType: "number",
    isList: false,
    isInput: false,
    name: "take",
    graphqlType: "Int",
    isNullable: true,
  };
  const skipArgField = {
    tsType: "number",
    isList: false,
    name: "skip",
    isInput: false,
    graphqlType: "Int",
    isNullable: true,
  };
  const updateArgField = {
    tsType: `${modelName}UpdateInput`,
    isList: true,
    isInput: true,
    name: "update",
    graphqlType: `${modelName}UpdateInput`,
    isNullable: false,
  };
  const createArgField = {
    tsType: `${modelName}CreateInput`,
    isList: false,
    isInput: true,
    name: "create",
    graphqlType: `${modelName}CreateInput`,
    isNullable: false,
  };

  const findArgs: ArgType = {
    name: `Find${modelName}Args`,
    docs: modelDocs.args?.find,
    args: [
      whereArgField,
      orderByArgField,
      cursorArgField,
      takeArgField,
      skipArgField,
    ],
  };
  const updateArgs: ArgType = {
    name: `Update${modelName}Args`,
    docs: modelDocs.args?.update,
    args: [whereUniqueArgField, updateArgField],
  };
  const upserArgs: ArgType = {
    name: `Upsert${modelName}Args`,
    docs: modelDocs.args?.upsert,
    args: [whereUniqueArgField, updateArgField, createArgField],
  };
  const createArgs: ArgType = {
    name: `Create${modelName}Args`,
    docs: modelDocs.args?.create,
    args: [createArgField],
  };
  const findUniqueArgs: ArgType = {
    name: `FindUnique${modelName}Args`,
    docs: modelDocs.args?.findUnique,
    args: [whereUniqueArgField],
  };
  const deleteManyeArgs: ArgType = {
    name: `DeleteMany${modelName}Args`,
    docs: modelDocs.args?.deleteMany,
    args: [whereArgField],
  };

  args.push(
    findArgs,
    updateArgs,
    upserArgs,
    createArgs,
    findUniqueArgs,
    deleteManyeArgs,
  );
  return args;
}

export function createActions(
  modelName: string,
  modelPlural: string,
  modelMiddlewares: CrudMiddleware,
  modelDocs: ModelDocs,
  texts: OrmText,
): Action[] {
  const res: Action[] = [];

  for (const action of modelActions) {
    const actRes = new Action();
    actRes.kind = action;
    actRes.body = getStatements(action, texts).map<string>(v =>
      replacOrmMessageTokens(v, {
        catchErrFunc: "catchErrorWrapper",
        type: modelName,
      }),
    );
    actRes.name =
      action === ModelAction.findUnique
        ? modelName.toLowerCase()
        : action === ModelAction.findMany
        ? modelPlural.toLowerCase()
        : `${action}${modelName}`;
    actRes.middlewares = getCrudMiddleware(action, modelMiddlewares);
    actRes.argsTypeName = getCrudArgsName(action, modelName);
    actRes.docs = getCrudDocs(action, modelDocs);
    const returnTypes = getCrudReturnTypes(action, modelName);
    actRes.typeGraphQLType = returnTypes.graphqlType;
    actRes.returnTSType = returnTypes.tsType;
    actRes.operation =
      action === ModelAction.findMany || action === ModelAction.findUnique
        ? "Query"
        : "Mutation";
    res.push(actRes);
  }

  return res;
}

function getCrudArgsName(action: ModelAction, modelName: string): string {
  switch (action) {
    case ModelAction.create:
      return `Create${modelName}Args`;
    case ModelAction.delete:
      return `FindUnique${modelName}Args`;
    case ModelAction.update:
      return `Update${modelName}Args`;
    case ModelAction.findUnique:
      return `FindUnique${modelName}Args`;
    case ModelAction.findMany:
      return `Find${modelName}Args`;
    case ModelAction.deleteMany:
      return `DeleteMany${modelName}Args`;
    case ModelAction.updateMany:
      return `Update${modelName}Args`;
    default:
      return `Custom${modelName}Args`;
  }
}

function getCrudMiddleware(
  action: ModelAction,
  middlewares: CrudMiddleware,
): string[] {
  switch (action) {
    case ModelAction.create:
      return middlewares.create;
    case ModelAction.delete:
      return middlewares.delete;
    case ModelAction.update:
      return middlewares.update;
    case ModelAction.findUnique:
      return middlewares.findUnique;
    case ModelAction.findMany:
      return middlewares.findMany;
    case ModelAction.deleteMany:
      return middlewares.deleteMany;
    case ModelAction.updateMany:
      return middlewares.updateMany;
    default:
      return [];
  }
}

function getCrudDocs(
  action: ModelAction,
  modelDocs: ModelDocs,
): string | undefined {
  if (!modelDocs.resolvers) {
    return undefined;
  }
  switch (action) {
    case ModelAction.create:
      return modelDocs.resolvers.create;
    case ModelAction.delete:
      return modelDocs.resolvers.delete;
    case ModelAction.update:
      return modelDocs.resolvers.update;
    case ModelAction.findUnique:
      return modelDocs.resolvers.findUnique;
    case ModelAction.findMany:
      return modelDocs.resolvers.findMany;
    case ModelAction.deleteMany:
      return modelDocs.resolvers.deleteMany;
    case ModelAction.updateMany:
      return modelDocs.resolvers.updateMany;
    default:
      return undefined;
  }
}

function getCrudReturnTypes(
  action: ModelAction,
  modelName: string,
): { tsType: string; graphqlType: string } {
  switch (action) {
    case ModelAction.create:
    case ModelAction.findUnique:
      return { graphqlType: modelName, tsType: modelName };
    case ModelAction.delete:
    case ModelAction.update:
      return {
        graphqlType: "IndivitualResponse",
        tsType: "IndivitualResponse",
      };
    case ModelAction.deleteMany:
    case ModelAction.updateMany:
      return { graphqlType: "BatchPayload", tsType: "BatchPayload" };
    case ModelAction.findMany:
      return { graphqlType: "[" + modelName + "]", tsType: modelName + "[]" };
    default:
      return { graphqlType: modelName, tsType: modelName };
  }
}

export function createInputTypes(
  modelName: string,
  modelFields: Field[],
  modelDocs: ModelDocs,
  ormType: SupportedOrms,
): InputType[] {
  const res: InputType[] = [];

  for (const input of inputClasses) {
    const inpRes = new InputType();
    inpRes.name = modelName;
    inpRes.type = input;
    inpRes.docs = getInputDocs(input, modelDocs);
    inpRes.typeName = `${inpRes.name}${input}Input`;
    const inputFields: InputField[] = [];
    modelFields
      .filter(field => {
        if (
          field.excludeFrom === ExcludeFieldFrom.graphql ||
          field.excludeFrom === ExcludeFieldFrom.both
        ) {
          return false;
        }
        if (field.isOmitted?.includes(input)) {
          return false;
        }
        if (field.tsType === "JsonValue") {
          inpRes.hasJsonValue = true;
        }
        if (input === "WhereUnique") {
          if (field.isId || field.isUnique) {
            return true;
          }
          return false;
        }
        if (
          field.name === "updatedAt" ||
          field.name === "createdAt" ||
          field.isId
        ) {
          if (input === "Create" || input === "Update") {
            return false;
          }
        }
        return true;
      })
      .forEach(field => {
        const res = new InputField();
        res.name = field.name;
        res.docs = field.docs;
        res.graphqlType = field.graphqlType;
        res.tsType = field.tsType;
        res.isFloat = field.isFloat;
        res.isList = field.isList;
        res.isEnum = field.isEnum;
        res.isNullable = field.isNullable;
        res.validations = field.decorators;
        inputFields.push(res);
      });
    if (input === "Create" || input === "Update" || input === "WhereUnique") {
      if (input === "Create") {
        inpRes.fields.push(...inputFields);
      } else {
        inpRes.fields.push(
          ...inputFields.map<InputField>(field => {
            field.isNullable = true;
            return field;
          }),
        );
      }
    }
    if (input === "OrderBy") {
      inpRes.hasJsonValue = false;
      inpRes.fields = inputFields.map<InputField>(v => {
        v.tsType = `"ASC" | "DESC" | 1 | -1`;
        v.graphqlType = "SortOrder";
        v.isNullable = true;
        return v;
      });
    }
    if (input === "Where") {
      inpRes.hasJsonValue = false;
      inpRes.fields = inputFields.map<InputField>(v => {
        v.graphqlType = `${ormType === "TypeOrm" ? "[" : ""}${mapTsToWhereType(
          v.tsType,
          v.isEnum,
          v.tsType.includes("[]") ? true : v.isList,
          v.isFloat,
        )}${ormType === "TypeOrm" ? "]" : ""}`;
        v.tsType = `${mapTsToWhereType(
          v.tsType,
          v.isEnum,
          v.tsType.includes("[]") ? true : v.isList,
          v.isFloat,
        )}${ormType === "TypeOrm" ? "[]" : ""}`;
        v.isNullable = true;
        v.isList = false;
        return v;
      });
    }
    res.push(inpRes);
  }

  return res;
}

function getStatements(kind: ModelAction, texts: OrmText): string[] {
  const res: string[] = [];
  if (kind === ModelAction.create) {
    res.push(texts.createRes);
  }
  if (kind === ModelAction.delete) {
    res.push(texts.deleteRes);
  }
  if (kind === ModelAction.deleteMany) {
    res.push(texts.deleteManyRes);
  }
  if (kind === ModelAction.update) {
    res.push(texts.updateRes);
  }
  if (kind === ModelAction.updateMany) {
    res.push(texts.updateManyRes);
  }
  if (kind === ModelAction.findUnique) {
    res.push(texts.findUniqueRes);
  }
  if (kind === ModelAction.findMany) {
    res.push(texts.findManyRes);
  }
  return res;
}

function getInputDocs(
  input: InputClasses,
  modelDocs: ModelDocs,
): string | undefined {
  if (!modelDocs.inputs) {
    return undefined;
  }
  switch (input) {
    case InputClasses.create:
      return modelDocs.inputs.create;
    case InputClasses.orderBy:
      return modelDocs.inputs.orderBy;
    case InputClasses.update:
      return modelDocs.inputs.update;
    case InputClasses.where:
      return modelDocs.inputs.where;
    case InputClasses.whereUnique:
      return modelDocs.inputs.whereUnique;
    default:
      return undefined;
  }
}
