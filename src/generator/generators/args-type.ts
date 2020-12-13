import { PropertyDeclarationStructure, OptionalKind, Project } from "ts-morph";
import path from "path";

import { argsFolderName } from "../config";
import {
  generateTypeGraphQLImport,
  generateGraphQLJsonImport,
  generateImport,
} from "./import";
import { ArgType } from "../mappers/mapper-types";

export default function generateArgsTypeClass(
  project: Project,
  generateDirPath: string,
  argType: ArgType,
  overwrite: boolean = true,
  hasJsonValue: boolean = false,
) {
  const dirPath = path.resolve(generateDirPath, argsFolderName);
  const filePath = path.resolve(dirPath, `${argType.name.replace("Args", ".args")}.ts`);
  const sourceFile = project.createSourceFile(filePath, undefined, {
    overwrite,
  });

  generateTypeGraphQLImport(sourceFile, ["ArgsType", "Field", "Int"]);
  if (hasJsonValue) {
    generateGraphQLJsonImport(sourceFile);
  }
  generateImport(sourceFile, "../inputs", {
    namedImports: argType.args.filter(v => v.isInput).map<string>(v => v.tsType),
  });

  sourceFile.addClass({
    name: argType.name,
    isExported: true,
    trailingTrivia: "\r\n",
    ...(argType.docs && {
      docs: [{ description: argType.docs }],
    }),
    decorators: [
      {
        name: "ArgsType",
        arguments: [],
      },
    ],
    properties: argType.args.map<OptionalKind<PropertyDeclarationStructure>>(
      arg => {
        return {
          name: arg.name,
          type: arg.tsType,
          hasQuestionToken: arg.isNullable,
          trailingTrivia: "\r\n",
          decorators: [
            {
              name: "Field",
              arguments: [
                `_type => ${arg.graphqlType}`,
                `{ nullable: ${arg.isNullable} }`,
              ],
            },
          ],
        };
      },
    ),
  });

  return sourceFile
}