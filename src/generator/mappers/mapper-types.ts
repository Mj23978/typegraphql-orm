export class Model {
  name: string;
  alias?: string;
  plural: string;
  extends: string;
  fields: Field[] = [];
  embeddedFields: Field[] = [];
  relationFields: Field[] = [];
  uniqueFields: string[] = [];
  enumFields: string[] = [];
  indexedFields: string[] = [];
  idField: string;
  hasJsonValue: boolean;
  resolverName: string;
  docs: ModelDocs;
  decorators: DecoratorData[] = [];
  middlewares: CrudMiddleware;
}

export class EmbeddedModel {
  name: string;
  extends: string;
  fields: Field[] = [];
  uniqueFields: string[] = [];
  enumFields: string[] = [];
  indexedFields: string[] = [];
  idField?: string;
  hasJsonValue: boolean;
}

export class Field {
  name: string;
  alias?: string;
  isNullable: boolean = false;
  isFloat: boolean = false;
  isList: boolean = false;
  isUnique: boolean = false;
  isIndex: boolean = false;
  isEmbedded: boolean = false;
  isId: boolean = false;
  isEnum: boolean = false;
  default?: string;
  defaultRaw?: string;
  docs?: string;
  graphqlType: string;
  tsType: string;
  diffOrmDecorator?: DecoratorData;
  diffGraphqlDecorator?: DecoratorData;
  decorators: DecoratorData[] = [];
  isOmitted?: InputClasses[] = [];
  excludeFrom?: ExcludeFieldFrom;
}

export class DecoratorData {
  name: string;
  text?: string
}

export class ModelDocs {
  model?: string;
  args?: {
    create?: string
    find?: string
    update?: string
    upsert?: string
    findUnique?: string
    deleteMany?: string
  }
  inputs?: {
    where?: string
    whereUnique?: string
    orderBy?: string
    create?: string
    update?: string
  }
  resolvers?: {
    resolver?: string
    create?: string
    update?: string
    delete?: string
    findUnique?: string
    findMany?: string
    deleteMany?: string
    updateMany?: string
  }
}

export class CrudMiddleware {
  create: string[] = [];
  update: string[] = [];
  delete: string[] = [];
  findUnique: string[] = [];
  findMany: string[] = [];
  deleteMany: string[] = [];
  updateMany: string[] = [];
}

export class ArgType {
  name: string;
  docs?: string;
  args: ArgField[] = [];
}

export class ArgField {
  name: string;
  comment?: string;
  isList: boolean;
  isInput: boolean;
  isNullable: boolean;
  graphqlType: string;
  tsType: string;
}

export class InputField {
  name: string;
  isList: boolean;
  isFloat: boolean;
  isEnum: boolean;
  isNullable: boolean;
  graphqlType: string;
  tsType: string;
  docs?: string;
  validations: DecoratorData[] = [];
}

export class InputType {
  name: string;
  typeName: string;
  type: InputClasses;
  hasJsonValue: boolean;
  fields: InputField[] = [];
  docs?: string;
}

export class Action {
  name: string;
  kind: ModelAction;
  operation: "Query" | "Mutation";
  argsTypeName?: string;
  returnTSType: string;
  typeGraphQLType: string;
  body: string[];
  middlewares: string[];
  docs?: string;
}

export enum ModelAction {
  findUnique = "findUnique",
  findMany = "findMany",
  create = "create",
  update = "update",
  updateMany = "updateMany",
  delete = "delete",
  deleteMany = "deleteMany",
}

export const modelActions: ModelAction[] = [
  ModelAction.findUnique,
  ModelAction.create,
  ModelAction.findMany,
  ModelAction.delete,
  ModelAction.update,
  ModelAction.deleteMany,
  ModelAction.updateMany,
];

export enum ExcludeFieldFrom {
  graphql = "graphql",
  orm = "orm",
  both = "both",
}

export enum InputClasses {
  whereUnique = "WhereUnique",
  where = "Where",
  create = "Create",
  update = "Update",
  orderBy = "OrderBy",
}

export const inputClasses: InputClasses[] = [
  InputClasses.create,
  InputClasses.orderBy,
  InputClasses.update,
  InputClasses.where,
  InputClasses.whereUnique
];