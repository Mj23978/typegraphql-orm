import { GenField, GenInput, GenModel } from "../generators/gen-types";
import { filterList } from "./helpers";

export type FilterType =
  | "$and"
  | "$not"
  | "$or"
  | "$eq"
  | "$ne"
  | "$in"
  | "$nin"
  | "$gt"
  | "$gte"
  | "$lt"
  | "$lte"
  | "$re"
  | "$like"
  | "$ilike"
  | "$overlap"
  | "$contains"
  | "$contained";

const filters: FilterType[] = [
  "$and",
  "$not",
  "$or",
  "$eq",
  "$ne",
  "$in",
  "$nin",
  "$gt",
  "$gte",
  "$lt",
  "$lte",
  "$re",
  "$like",
  "$ilike",
  "$overlap",
  "$contains",
  "$contained",
];

function createFilter(
  name: string,
  filters: FilterType[],
  tsType: string,
  graphqlType: string,
): GenInput {
  const res = new GenInput();
  res.name = `${name}Filter`;
  res.fields = filters.map(v => {
    const resF = new GenField();
    resF.name = v;
    const getTypes = getFilterTypes(v, res.name, tsType, graphqlType);
    resF.isNullable = true;
    resF.type = getTypes[0];
    resF.decorators.push({
      name: "Field",
      arguments: [
        `_type => ${getTypes[1]}, { name: "${v.replace(
          "$",
          "",
        )}", nullable: true, description: undefined}`,
      ],
    });
    return resF;
  });
  res.decorators.push({
    name: "InputType",
    arguments: [`{ isAbstract: true, description: undefined }`],
  });
  return res;
}

function getFilterTypes(
  filterType: FilterType,
  name: string,
  tsType: string,
  graphqlType: string,
): [string, string] {
  switch (filterType) {
    case "$and":
      return [name + "[]", "[" + name + "]"];
    case "$contained":
      return ["string[]", "[String]"];
    case "$contains":
      return ["string[]", "[String]"];
    case "$eq":
      return [tsType, graphqlType];
    case "$gt":
      return [tsType, graphqlType];
    case "$gte":
      return [tsType, graphqlType];
    case "$ilike":
      return ["string", "String"];
    case "$in":
      return [tsType + "[]", "[" + graphqlType + "]"];
    case "$like":
      return ["string", "String"];
    case "$lt":
      return [tsType, graphqlType];
    case "$lte":
      return [tsType, graphqlType];
    case "$ne":
      return [tsType, graphqlType];
    case "$nin":
      return [tsType + "[]", "[" + graphqlType + "]"];
    case "$not":
      return [name, name];
    case "$or":
      return [name + "[]", "[" + name + "]"];
    case "$overlap":
      return ["string[]", "[String]"];
    case "$re":
      return ["string", "String"];
    default:
      return [tsType, graphqlType];
  }
}

export function createMikroOrmFilters(
  enums: string[],
  embModels: string[],
): GenInput[] {
  const res: GenInput[] = [];
  const validForBool: FilterType[] = [
    "$and",
    "$contained",
    "$contains",
    "$overlap",
    "$eq",
    "$ne",
    "$not",
    "$or",
  ];
  const validForString: FilterType[] = [
    ...validForBool,
    "$in",
    "$nin",
    "$like",
    "$ilike",
    "$overlap",
  ];
  const validForDate: FilterType[] = [
    ...validForString,
    "$gte",
    "$lte",
    "$lt",
    "$gt",
  ];
  res.push(createFilter("Float", filters, "number", "Float"));
  res.push(createFilter("Int", filters, "number", "Int"));
  res.push(
    createFilter(
      "Bool",
      filterList(filters, validForBool),
      "boolean",
      "Boolean",
    ),
  );
  res.push(
    createFilter("DateTime", filterList(filters, validForDate), "Date", "Date"),
  );
  res.push(
    createFilter(
      "Json",
      filterList(filters, validForString),
      "JsonValue",
      "GraphQLJSON",
    ),
  );
  res.push(
    createFilter(
      "String",
      filterList(filters, validForString),
      "string",
      "String",
    ),
  );
  res.push(
    createFilter(
      "FloatList",
      filterList(filters, validForString),
      "number[]",
      "[Float]",
    ),
  );
  res.push(
    createFilter(
      "IntList",
      filterList(filters, validForString),
      "number[]",
      "[Int]",
    ),
  );
  res.push(
    createFilter(
      "BoolList",
      filterList(filters, validForString),
      "boolean[]",
      "[Boolean]",
    ),
  );
  res.push(
    createFilter(
      "DateTimeList",
      filterList(filters, validForString),
      "Date[]",
      "[Date]",
    ),
  );
  res.push(
    createFilter(
      "JsonList",
      filterList(filters, validForString),
      "JsonValue[]",
      "[GraphQLJSON]",
    ),
  );
  res.push(
    createFilter(
      "StringList",
      filterList(filters, validForString),
      "string[]",
      "[String]",
    ),
  );
  enums.forEach(v => {
    res.push(
      createFilter(`Enum${v}`, filterList(filters, validForBool), v, v),
      createFilter(
        `EnumList${v}`,
        filterList(filters, validForBool),
        v + "[]",
        "[" + v + "]",
      ),
    );
  });
  embModels.forEach(v => {
    res.push(
      createFilter(`${v}`, filterList(filters, validForString), v, v),
      createFilter(
        `${v}List`,
        filterList(filters, validForBool),
        v + "[]",
        "[" + v + "]",
      ),
    );
  });
  return res;
}
