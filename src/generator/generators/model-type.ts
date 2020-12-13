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
} from "./import";
import {
  SupportedOrms,
} from "../config";
import { Model } from "../mappers/mapper-types";
import { fieldDecoratorGraphQl, fieldDecoratorOrm } from "./model-helpers";

export default function generateModelType(
  project: Project,
  baseDirPath: string,
  model: Model,
  ormType: SupportedOrms,
  overwrite: boolean = false,
) {
  const filePath = path.resolve(baseDirPath, `${model.name}.entity.ts`);
  const sourceFile = project.createSourceFile(filePath, undefined, {
    overwrite,
  });

  generateTypeGraphQLImport(sourceFile, [
    "ObjectType",
    "Field",
    "Int",
    "Float",
  ]);
  if (model.hasJsonValue) {
    generateGraphQLJsonImport(sourceFile);
  }
  if (ormType === "TypeOrm") {
    generateTypeOrmImport(sourceFile);
  }

  sourceFile.addClass({
    name: model.name,
    isExported: true,
    extends: model.extends,
    ...(model.docs.model && { docs: [{ description: model.docs.model }] }),
    decorators: [
      {
        name: "ObjectType",
        arguments: [
          [`{`, `description: "${model.docs?.model}",`, `}`].join("\r\n"),
        ],
      },
      {
        name: "Entity",
        arguments: [""],
      },
      ...model.uniqueFields.map<OptionalKind<DecoratorStructure>>(v => {
        return {
          name: "Unique",
          arguments: [
            ormType === "TypeOrm" ? `["${v}"]` : `{properties: [${v}]}`,
          ],
        };
      }),
      ...model.decorators.map<OptionalKind<DecoratorStructure>>(v => {
        return {
          name: v.name,
          arguments: [v.text || ""],
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

  return sourceFile
}

