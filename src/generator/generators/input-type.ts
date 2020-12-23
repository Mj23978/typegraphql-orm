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
} from "./import";
import { GenInput } from "./gen-types";

export function generateInputType(
  project: Project,
  dirPath: string,
  inputType: GenInput,
  overwrite: boolean = false,
) {
  const filePath = path.resolve(
    dirPath,
    `${inputType.name.replace("Input", ".input")}.ts`,
  );
  const sourceFile = project.createSourceFile(filePath, undefined, {
    overwrite,
  });

  generateTypeGraphQLImport(sourceFile, ["Field", "InputType", "Int", "Float"]);
  if (inputType.hasJsonValue) {
    generateGraphQLJsonImport(sourceFile);
  }

  sourceFile.addClass({
    name: inputType.name,
    isExported: true,
    decorators: inputType.decorators,
    properties: inputType.fields.map<
      OptionalKind<PropertyDeclarationStructure>
    >(field => {
      return {
        name: field.name,
        type: field.type,
        hasQuestionToken: field.isNullable,
        trailingTrivia: "\r\n",
        decorators: field.decorators,
      };
    }),
  });

  return sourceFile
}
