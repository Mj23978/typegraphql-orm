import {
  PropertyDeclarationStructure,
  OptionalKind,
  Project,
} from "ts-morph";
import path from "path";

import {
  generateTypeGraphQLImport,
  generateGraphQLJsonImport,
  generateTypeOrmImport,
  generateMikroOrmImport,
} from "./import";
import { SupportedOrms } from "../config";
import { IGenModel } from "./gen-types";

export default function generateModelType(
  project: Project,
  baseDirPath: string,
  model: IGenModel,
  ormType: SupportedOrms,
  isEmbedded: boolean,
  overwrite: boolean = false,
) {
  const sourceFile = project.createSourceFile(
    path.resolve(baseDirPath, isEmbedded ? "embedded" : "", isEmbedded ? `${model.name}.ts` : `${model.name}.entity.ts`),
    undefined,
    { overwrite },
  );

  generateTypeGraphQLImport(sourceFile, [
    "ObjectType",
    "InputType",
    "Field",
    "Int",
    "Float",
  ]);
  if (model.hasJsonValue) {
    generateGraphQLJsonImport(sourceFile);
  }
  ormType === "MikroOrm"
    ? generateMikroOrmImport(sourceFile, ["EntityManager"])
    : generateTypeOrmImport(sourceFile, ["BaseEntity"]);

  sourceFile.addClass({
    name: model.name,
    isExported: true,
    extends: isEmbedded ? undefined : model.heritage,
    decorators: model.decorators,
    properties: [
      ...model.fields.map<OptionalKind<PropertyDeclarationStructure>>(field => {
        return {
          name: field.name,
          type: field.type,
          initializer: field.default,
          hasQuestionToken: field.isNullable,
          trailingTrivia: "\r\n",
          decorators: field.decorators,
          ...(field.docs && {
            docs: [{ description: field.docs }],
          }),
        };
      }),
    ],
  });

  return sourceFile;
}

