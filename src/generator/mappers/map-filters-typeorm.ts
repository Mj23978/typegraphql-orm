import { paramCase } from 'change-case'
import { GenInput } from '../generators/gen-types'

export class Filter {
  name: string
  fields: FilterField[] = []
  maaper: FilterMapper
  utils?: {
    tsType: string
    graphqlType: string
  }
}

export class FilterField {
  name: string
  tsType: string
  graphqlType: string
  isList: boolean
}

export class FilterMapper {
  name: string
  text: string
  anotherFuncs?: {
    name: string
    text: string
    args: string
  }[] = []
}

export type FilterType = ( "equals" | "notEquals" | "in" | "notIn" | "gte" | "gt" | "lt" | "lte" | "between" )

function createFilter(name: string, filters: FilterType[], tsType: string, graphqlType: string, utils?: string): Filter {
  // const res: Filter[] = []
  const filter = new Filter()
  filter.name = `${name}Filter`
  let utilsType: string;
  let haveUtils = false
  if (utils) {
    utilsType = `${filter.name}${utils}`;
    haveUtils = true
    filter.utils = { graphqlType, tsType }
    tsType = utilsType
    graphqlType = utilsType
  }
  if (filters.includes("equals")) {
    filter.fields.push(createFilterField("equals", tsType, graphqlType, haveUtils))
  }
  if (filters.includes("notEquals")) {
    filter.fields.push(createFilterField("notEquals", tsType, graphqlType, haveUtils))
  }
  if (filters.includes("in")) {
    filter.fields.push(createFilterField("in", tsType, graphqlType, haveUtils, true))
  }
  if (filters.includes("notIn")) {
    filter.fields.push(createFilterField("notIn", tsType, graphqlType, haveUtils, true))
  }
  if (filters.includes("between")) {
    filter.fields.push(createFilterField("between", tsType, graphqlType, haveUtils, true))
  }
  if (filters.includes("lt")) {
    filter.fields.push(createFilterField("lt", tsType, graphqlType, haveUtils))
  }
  if (filters.includes("lte")) {
    filter.fields.push(createFilterField("lte", tsType, graphqlType, haveUtils))
  }
  if (filters.includes("gt")) {
    filter.fields.push(createFilterField("gt", tsType, graphqlType, haveUtils))
  }
  if (filters.includes("gte")) {
    filter.fields.push(createFilterField("gte", tsType, graphqlType, haveUtils))
  }
  filter.maaper = {
    name: `${paramCase(filter.name)}ToRaw`,
    text: `if (filter === undefined) {
    return Raw(_alias => "")
  }
  const raw = Raw(alias => {
    const builder: string[] = []
    for (const v of filter) {
      builder.push(getAliasString(alias, v))
    }
    return builder.join(" ")
  })
  return raw`,
    anotherFuncs: [
      {
        name: "getAliasString",
        args: `alias: string, filter: ${name}`,
        text: ` const builder: string[] = []
  ${filters.map(
    v => `if (filter.${v}) {
    builder.push(\`\${filter.${v}.op ? filter.${v}.op : ""} \${alias} ${getFilterOperator(v)} \${filter.${v}}${utils === "Date" ? (v === "in" || v === "notIn" || v === "between") ? "" : "::timestamp" : ""}\`)
  }`,
  )}
  return builder.join(" ")`,
      },
    ],
  };
  return filter
}

function getFilterOperator(filterType: FilterType): string {
  switch (filterType) {
    case "between": 
      return "BETWEEN";
    case "equals": 
      return "=";
    case "gt": 
      return ">";
    case "gte": 
      return ">=";
    case "lt": 
      return "<";
    case "lte": 
      return "<=";
    case "notEquals": 
      return "<>";
    case "in": 
      return "IN";
    case "notIn": 
      return "!!=";
    default:
      return "=";
  }
}

function createFilterField(name: string, tsType: string, graphqlType: string, haveUtils: boolean, isList: boolean = false): FilterField { 
  const filterField = new FilterField()
  filterField.name = name
  filterField.tsType = haveUtils ? `${isList ? `${tsType}[]` : tsType}` : `${tsType}${isList ? "List" : ""}`
  filterField.graphqlType = haveUtils
      ? `${isList ? `[${graphqlType}]` : graphqlType}`
      : `${graphqlType}${isList ? "List" : ""}`;
  return filterField
}

function mapToInput(filters: Filter[]): GenInput[] {
  return filters.map<GenInput>(v => {
    const res = new GenInput()
    res.name = v.name
    res.hasJsonValue = false
    return res
  })
}

export function createTypeOrmFilters(enums: string[]): GenInput[] {
  const filters: Filter[] = []
  filters.push(createFilter("Float", ["equals", "notEquals", "gt", "gte", "lt", "lte", "in", "notIn"], "number", "Float", "Float"))
  filters.push(createFilter("Int", ["equals", "notEquals", "gt", "gte", "lt", "lte", "in", "notIn"], "number", "Int", "Int"))
  filters.push(createFilter("Bool", ["equals", "notEquals"], "boolean", "Boolean"))
  filters.push(createFilter("DateTime", ["equals", "notEquals", "gt", "gte", "lt", "lte", "in", "notIn", "between"], "Date", "Date", "Date"))
  filters.push(createFilter("Json", ["equals", "notEquals"], "JsonValue", "GraphQLJSON"))
  filters.push(createFilter("String", ["equals", "notEquals", "in", "notIn"], "JsonValue", "GraphQLJSON"))
  filters.push(
    createFilter(
      "FloatList",
      ["equals", "notEquals"],
      "FloatFilterFloatList",
      "FloatFilterFloatList",
    ),
  );
  filters.push(
    createFilter(
      "IntList",
      ["equals", "notEquals"],
      "IntFilterIntList",
      "IntFilterIntList",
    ),
  );
  filters.push(
    createFilter(
      "BoolList",
      ["equals", "notEquals"],
      "boolean[]",
      "[Boolean]",
    ),
  );
  filters.push(
    createFilter(
      "DateTimeList",
      ["equals", "notEquals"],
      "DateTimeFilterDateList",
      "DateTimeFilterDateList",
    ),
  );
  filters.push(
    createFilter(
      "JsonList",
      ["equals", "notEquals"],
      "JsonFilterJsonList",
      "JsonFilterJsonList",
    ),
  );
  filters.push(
    createFilter(
      "StringList",
      ["equals", "notEquals"],
      "StringFilterStringList",
      "StringFilterStringList",
    ),
  );
  enums.forEach(v => {
    filters.push(createFilter(`Enum${v}`, ["in", "notIn", "equals", "notEquals"], v, v), createFilter(`EnumList${v}`, ["equals", "notEquals"], v + "[]", "[" + v + "]"))
  })
  return mapToInput(filters)
}