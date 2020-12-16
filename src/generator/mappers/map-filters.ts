
export class Filter {
  name: string
  fields: FilterField[] = []
  maaper: FilterMapper
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

export type FilterType = ( "equals" | "notEquals" | "in" | "notIn" )

function createFilter(name: string, tsType: string, graphqlType: string, isList: boolean, filters: FilterType[]): Filter {
  const res = new Filter()
  res.name = name
  if (filters.includes("equals")) {
    res.fields.push(createFilterField("equals", tsType, graphqlType))
  }
  if (filters.includes("notEquals")) {
    res.fields.push(createFilterField("notEquals", tsType, graphqlType))
  }
  if (filters.includes("in")) {
    res.fields.push(createFilterField("in", tsType, graphqlType))
  }
  if (filters.includes("notIn")) {
    res.fields.push(createFilterField("notIn", tsType, graphqlType))
  }
  res.maaper = {
    name: `${graphqlType.toLowerCase()}`,
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
  ${filters.map(v => `if (filter.${v}) {
    builder.push(\`\${alias} = \${filter.${v}}\`)
  }`)}
  return builder.join(" ")`
      },
    ],
  };
  return res
}

function createFilterField(name: string, tsType: string, graphqlType: string, isList: boolean = false): FilterField { 
  const resField = new FilterField()
  resField.name = name
  resField.tsType = tsType
  resField.graphqlType = graphqlType
  return resField
}