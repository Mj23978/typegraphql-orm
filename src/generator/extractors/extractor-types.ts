export class ExtData {
  models: ExtModel[] = [];
  imports: ImportModel[] = [];
  enums: ExtEnum[] = [];
}

export class ExtModel {
  name: string;
  docs: string;
  heritages: string[] = [];
  decorators: ExtDecorator[] = [];
  properties: ExtProperty[] = [];
}

export class ExtEnum {
  name: string;
  members: string[];
}

export class ImportModel {
  moduleName: string;
  namedImports: string[] = [];
  defaultImport?: string;
}

export class ExtDecorator {
  name: string;
  properties: any[];
  propText: string;
}

export class ExtProperty {
  name: string;
  docs: string;
  isNullable: boolean;
  isList: boolean;
  type: ExtPropType;
  decorators: ExtDecorator[] = [];
}

export class ExtPropType {
  type: TsTypes;
  refType?: string;
  union: ExtPropType[] = [];
  enumFields: string[] = [];
}

export declare type TsTypes =
  | "string"
  | "number"
  | "Date"
  | "boolean"
  | "JsonValue"
  | "null"
  | "enum"
  | "undefined"
  | "Union"
  | "TypeReference";
