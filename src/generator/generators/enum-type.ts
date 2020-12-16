import { EnumMemberStructure, OptionalKind, Project } from "ts-morph";
import path from "path";
import { generateTypeGraphQLImport } from "./import";
import { enumsFolderName } from "../config";
import { ExtEnum } from "../extractors/extractor-types";

export default function generateEnum(
  project: Project,
  baseDirPath: string,
  enm: ExtEnum,
  generate: boolean,
  overwrite: boolean = false,
  enumDocs?: string,
) {
  const filePath = path.resolve(
    baseDirPath,
    generate ? `${enumsFolderName}/${enm.name}.ts` : `${enumsFolderName}.ts`,
  );
  const sourceFile = project.createSourceFile(filePath, undefined, {
    overwrite,
  });

  generateTypeGraphQLImport(sourceFile, ["registerEnumType"]);

  if (generate) {
    sourceFile.addEnum({
      isExported: true,
      name: enm.name,
      ...(enumDocs && { docs: [{ description: enumDocs }] }),
      members: enm.members?.map<OptionalKind<EnumMemberStructure>>(
        ({ name, value }) => ({
          name,
          value: name,
        }),
      ),
    });
  }

  const exprExist = sourceFile.getStatement(statement => {
    return statement.getText().includes(`registerEnumType(${enm.name}`);
  });
  if (exprExist === undefined) {
    sourceFile.addStatements([
      `
registerEnumType(${enm.name}, {
  name: "${enm.name}",
  description: ${enumDocs ? `"${enumDocs}"` : "undefined"},
});`,
    ]);
  }

  return sourceFile
}
