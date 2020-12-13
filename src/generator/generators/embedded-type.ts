import {
  PropertyDeclarationStructure,
  OptionalKind,
  Project,
  DecoratorStructure,
} from "ts-morph";
import path from "path";

import {
  generateTypeGraphQLImport,
  generateGraphQLJsonImport,
  generateTypeOrmImport,
  generateMikroOrmImport,
} from "./import";
import { SupportedOrms } from "../config";
import { EmbeddedModel } from "../mappers/mapper-types";
import { fieldDecoratorGraphQl, fieldDecoratorOrm } from "./model-helpers";

export default function generateEmbeddedModelType(
  project: Project,
  baseDirPath: string,
  model: EmbeddedModel,
  ormType: SupportedOrms,
  overwrite: boolean = false,
) {
  const sourceFile = project.createSourceFile(
    path.resolve(baseDirPath, "embedded", `${model.name}.ts`),
    undefined,
    { overwrite },
  );

  generateTypeGraphQLImport(sourceFile, [
    "ObjectType",
    "Field",
    "Int",
    "Float",
  ]);
  if (model.hasJsonValue) {
    generateGraphQLJsonImport(sourceFile);
  }
  ormType === "MikroOrm"
    ? generateMikroOrmImport(sourceFile)
    : generateTypeOrmImport(sourceFile);

  sourceFile.addClass({
    name: model.name,
    isExported: true,
    extends: model.extends,
    decorators: [
      {
        name: "ObjectType",
        arguments: [""],
      },
      ...(ormType === "MikroOrm"
        ? [
            {
              name: "Embeddable",
              arguments: [""],
            },
          ]
        : []),
      ...model.uniqueFields.map<OptionalKind<DecoratorStructure>>(v => {
        return {
          name: "Unique",
          arguments: [
            ormType === "TypeOrm" ? `["${v}"]` : `{properties: [${v}]}`,
          ],
        };
      }),
    ],
    properties: [
      ...model.fields.map<OptionalKind<PropertyDeclarationStructure>>(field => {
        const decrGraphql = fieldDecoratorGraphQl(field);
        const decrOrm = fieldDecoratorOrm(field, ormType);
        const decorators: OptionalKind<DecoratorStructure>[] = [];
        decrGraphql ? decorators.push(decrGraphql) : undefined;
        decrOrm ? decorators.push(decrOrm) : undefined;
        decorators.push(
          ...field.decorators.map<OptionalKind<DecoratorStructure>>(v => ({
            name: v.name,
            arguments: [v.text || ""],
          })),
        );
        field.isIndex
          ? decorators.push({
              name: "Index",
              arguments: [""],
            })
          : undefined;
        return {
          name: field.name,
          type: field.tsType,
          initializer: field.default,
          hasQuestionToken: field.isNullable,
          trailingTrivia: "\r\n",
          decorators,
          ...(field.docs && {
            docs: [{ description: field.docs }],
          }),
        };
      }),
    ],
  });

  return sourceFile;
}
