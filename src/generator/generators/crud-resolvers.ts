import { OptionalKind, MethodDeclarationStructure, Project } from "ts-morph";
import path from "path";

import { generateTypeGraphQLImport, generateImport } from "./import";
import { Action, ModelAction } from "../mappers/mapper-types";
import { GenAction } from "./gen-types";

export default function generateCrudResolver(
  project: Project,
  baseDirPath: string,
  actionType: GenAction,
  overwrite: boolean = false,
) {
  const resolverDirPath = path.resolve(baseDirPath, actionType.modelName);
  const filePath = path.resolve(
    resolverDirPath,
    `${actionType.name.replace("Resolver", ".resolver")}.ts`,
  );
  const sourceFile = project.createSourceFile(filePath, undefined, {
    overwrite,
  });

  generateTypeGraphQLImport(sourceFile, [
    "Resolver",
    "Args",
    "Ctx",
    "Mutation",
    "Query",
  ]);
  generateImport(sourceFile, "./args", {
    namedImports: actionType.args,
  });
  generateImport(sourceFile, "../../models", {
    namedImports: [actionType.modelName],
  });

  sourceFile.addClass({
    name: actionType.name,
    isExported: true,
    ...(actionType.docs && {
      docs: [{ description: actionType.docs }],
    }),
    decorators: actionType.decorators,
    methods: actionType.methods
  });

  return sourceFile;
}
