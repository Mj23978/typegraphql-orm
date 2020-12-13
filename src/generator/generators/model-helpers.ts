import { DecoratorStructure, OptionalKind } from "ts-morph";
import { SupportedOrms } from "../config";
import { ExcludeFieldFrom, Field } from "../mappers/mapper-types";
import { MikroOrmText } from "../texts/mikro-orm";
import { TypeOrmText } from "../texts/typeorm";


export function fieldDecoratorGraphQl(
  field: Field,
): OptionalKind<DecoratorStructure> | undefined {
  const fieldName = "Field";
  return field.excludeFrom !== ExcludeFieldFrom.graphql &&
    field.excludeFrom !== ExcludeFieldFrom.both
    ? {
        name: fieldName,
        arguments: [
          [
            `_type => ${field.graphqlType},`,
            `{`,
            `nullable: ${field.isNullable},`,
            `description: ${field.docs ? `"${field.docs}"` : "undefined"},`,
            `}`,
          ].join(" "),
        ],
      }
    : undefined;
}

export function fieldDecoratorOrm(
  field: Field,
  ormType: SupportedOrms,
): OptionalKind<DecoratorStructure> | undefined {
  const include =
    field.excludeFrom !== ExcludeFieldFrom.orm &&
    field.excludeFrom !== ExcludeFieldFrom.both;
  if ((field.isEnum || field.isEmbedded) && ormType === "MikroOrm" && include) {
    return {
      name: field.isEnum ? "Enum" : "Embedded",
      arguments: [
        field.isEnum
          ? `{ items: () => ${field.tsType}, ${
              field.isNullable ? "nullable: true," : ""
            } ${field.isList ? "array: true," : ""}}`
          : ``,
      ],
    };
  }
  let fieldName =
    ormType === "MikroOrm"
      ? MikroOrmText.normalDecoratorName
      : TypeOrmText.normalDecoratorName;
  const args: string[] = [];
  args.push("");
  if (field.diffOrmDecorator) {
    fieldName = field.diffOrmDecorator.name;
    args.push(field.diffOrmDecorator.text || "");
  } else if (field.isId) {
    fieldName =
      ormType === "MikroOrm"
        ? MikroOrmText.idDecoratorName
        : TypeOrmText.idDecoratorName;
    // enum - nullable - type - array - default
  } else if (
    field.default ||
    field.isEmbedded ||
    field.defaultRaw ||
    field.isNullable ||
    field.isList ||
    field.isEnum ||
    field.tsType === "JsonValue"
  ) {
    field.isEmbedded ? args.push(`_type => ${field.tsType}`) : undefined;
    args.push("{ ");
    field.default ? args.push(`default: ${field.default}, `) : undefined;
    field.defaultRaw
      ? ormType === "MikroOrm"
        ? args.push(`defaultRaw: ${field.defaultRaw}, `)
        : undefined
      : undefined;
    field.isEnum
      ? args.push(`type: "enum", enum: ${field.tsType}, `)
      : undefined;
    field.isNullable ? args.push(`nullable: true, `) : undefined;
    field.tsType === "JsonValue" ? args.push(`type: "json", `) : undefined;
    field.isList ? args.push(`array: true, `) : undefined;
    args.push("}");
  }
  return include
    ? {
        name: fieldName,
        arguments: [args.join(" ")],
      }
    : undefined;
}
