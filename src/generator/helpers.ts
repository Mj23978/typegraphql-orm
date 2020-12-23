export function mapScalarToTSType(scalar: string) {
  switch (scalar) {
    case "ID":
    case "UUID": {
      return "string";
    }
    case "String": {
      return "string";
    }
    case "Boolean": {
      return "boolean";
    }
    case "DateTime": {
      return "Date";
    }
    case "Int":
    case "Float": {
      return "number";
    }
    case "Json":
      return "JsonValue";
    default:
      throw new Error(`Unrecognized scalar type: ${scalar}`);
  }
}

export function mapTsToWhereType(tsType: string, isEnum: boolean = false, isList: boolean = false, isFloat: boolean = false): string {
  switch (tsType) {
    case "string": {
      return isList ? "StringListFilter" : "StringFilter";
    }
    case "boolean": {
      return isList ? "BoolListFilter" : "BoolFilter";
    }
    case "DateTime": 
    case "Date": {
      return isList ? "DateTimeListFilter" : "DateTimeFilter";
    }
    case "number": {
      return isList ? isFloat ? "FloatListFilter" : "IntListFilter" : isFloat ? "FloatFilter" : "IntFilter";
    }
    case "JsonValue":
      return isList ? "JsonListFilter" : "JsonFilter";
    default:
      if (isEnum) {
        return isList ? `EnumList${tsType.replace("[]", "")}Filter` : `Enum${tsType.replace("[]", "")}Filter`
      }
      return `${tsType.replace("[]", "")}Filter`
  }
}

export function mapTsToScalarType(scalar: string, isFloat: boolean = false): string {
  switch (scalar) {
    case "string": {
      return "String";
    }
    case "boolean": {
      return "Boolean";
    }
    case "Date": {
      return "DateTime";
    }
    case "number": {
      return isFloat ? "Float" : "Int";
    }
    case "JsonValue":
      return "GraphQLJSON";
    case "enum": 
      return scalar
    default:
      throw new Error(`Unrecognized scalar type: ${scalar}`);
  }
}

export function mapScalarToTypeGraphQLType(scalar: string) {
  switch (scalar) {
    case "DateTime": {
      return "Date";
    }
    // TODO: use proper uuid graphql scalar
    case "UUID": {
      return "String";
    }
    case "Boolean":
    case "String": {
      return scalar;
    }
    case "ID":
    case "Int":
    case "Float": {
      return `TypeGraphQL.${scalar}`;
    }
    case "Json": {
      return `GraphQLJSON`;
    }
    default: {
      throw new Error(`Unrecognized scalar type: ${scalar}`);
    }
  }
}

export function toUnixPath(maybeWindowsPath: string) {
  return maybeWindowsPath.split("\\").join("/");
}
