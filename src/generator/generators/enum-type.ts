import { EnumMemberStructure, OptionalKind, Project } from "ts-morph";
import path from "path";
import { generateTypeGraphQLImport } from "./import";
import { enumsFolderName } from "../config";

export default function generateEnum(
  project: Project,
  baseDirPath: string,
  enumName: string,
  generate: boolean,
  enumValues?: { name: string; value: string }[],
  overwrite: boolean = false,
  enumDocs?: string,
) {
  const filePath = path.resolve(
    baseDirPath,
    generate ? `${enumsFolderName}/${enumName}.ts` : `${enumsFolderName}.ts`,
  );
  const sourceFile = project.createSourceFile(filePath, undefined, {
    overwrite,
  });

  generateTypeGraphQLImport(sourceFile, ["registerEnumType"]);

  if (generate) {
    sourceFile.addEnum({
      isExported: true,
      name: enumName,
      ...(enumDocs && { docs: [{ description: enumDocs }] }),
      members: enumValues?.map<OptionalKind<EnumMemberStructure>>(
        ({ name, value }) => ({
          name,
          value,
        }),
      ),
    });
  }

  const exprExist = sourceFile.getStatement(statement => {
    return statement.getText().includes(`registerEnumType(${enumName}`);
  });
  if (exprExist === undefined) {
    sourceFile.addStatements([
      `
registerEnumType(${enumName}, {
  name: "${enumName}",
  description: ${enumDocs ? `"${enumDocs}"` : "undefined"},
});`,
    ]);
  }

  return sourceFile
}
