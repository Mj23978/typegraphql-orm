import { TogRelationOptions } from "../decorators";
import { GenDecorator } from "../generators/gen-types";
import { GraphqlMapper } from "./interfaces";
import { ExcludeFieldFrom, Field } from "./mapper-types";

export class TypeGraphqlMapper extends GraphqlMapper {
  genModelFieldDecorator(field: Field): GenDecorator[] {
    const fieldName = "Field";
    return [
      ...(field.excludeFrom !== ExcludeFieldFrom.graphql &&
      field.excludeFrom !== ExcludeFieldFrom.both
        ? [
            {
              name: fieldName,
              arguments: [
                [
                  `_type => ${field.graphqlType},`,
                  `{`,
                  `nullable: ${field.isNullable},`,
                  `description: ${
                    field.docs ? `"${field.docs}"` : "undefined"
                  },`,
                  `}`,
                ].join(" "),
              ],
            },
          ]
        : []),
    ];
  }

  genModelDecorator(modelName: string, docs?: string, input: boolean = false): GenDecorator[] {
    return [
      ...(input ? [{
        name: "InputType",
        arguments: [`"${modelName}"`]
      }] : []),
      {
        name: "ObjectType",
        arguments: [`{ description: ${docs}}`],
      },
    ];
  }

  genInputFieldDecorator(opts: TogRelationOptions): GenDecorator[] {
    throw new Error("Method not implemented.");
  }
}
