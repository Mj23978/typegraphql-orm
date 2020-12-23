import { PropertyDeclarationStructure, OptionalKind, Project } from "ts-morph";
import path from "path";

import { argsFolderName } from "../config";
import {
  generateTypeGraphQLImport,
  generateGraphQLJsonImport,
  generateImport,
} from "./import";
import { GenArg } from "./gen-types";

export default function generateArgsTypeClass(
  project: Project,
  generateDirPath: string,
  argType: GenArg,
  overwrite: boolean = true,
) {
  const dirPath = path.resolve(generateDirPath, argsFolderName);
  const filePath = path.resolve(dirPath, `${argType.name.replace("Args", ".args")}.ts`);
  const sourceFile = project.createSourceFile(filePath, undefined, {
    overwrite,
  });

  generateTypeGraphQLImport(sourceFile, ["ArgsType", "Field", "Int"]);
  generateImport(sourceFile, "../inputs", {
    namedImports: argType.inputs,
  });

  sourceFile.addClass({
    name: argType.name,
    isExported: true,
    trailingTrivia: "\r\n",
    ...(argType.docs && {
      docs: [{ description: argType.docs }],
    }),
    decorators: argType.decorators,
    properties: argType.fields.map<OptionalKind<PropertyDeclarationStructure>>(
      arg => {
        return {
          name: arg.name,
          type: arg.type,
          hasQuestionToken: arg.isNullable,
          trailingTrivia: "\r\n",
          decorators: arg.decorators
        };
      },
    ),
  });

  return sourceFile
}