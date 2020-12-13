import {
  PropertyDeclarationStructure,
  OptionalKind,
  Project,
  DecoratorStructure,
} from "ts-morph";
import path from "path";

import { formatSetting, importPreference } from "../config";
import {
  generateTypeGraphQLImport,
  generateGraphQLJsonImport,
} from "./import";
import { InputClasses, InputType } from "../mappers/mapper-types";

export function generateInputType(
  project: Project,
  dirPath: string,
  inputType: InputType,
  overwrite: boolean = false,
) {
  const filePath = path.resolve(
    dirPath,
    `${inputType.typeName.replace("Input", ".input")}.ts`,
  );
  const sourceFile = project.createSourceFile(filePath, undefined, {
    overwrite,
  });

  generateTypeGraphQLImport(sourceFile, ["Field", "InputType", "Int", "Float"]);
  if (inputType.hasJsonValue) {
    generateGraphQLJsonImport(sourceFile);
  }

  sourceFile.addClass({
    name: inputType.typeName,
    isExported: true,
    decorators: [
      {
        name: "InputType",
        arguments: [
          `{
  isAbstract: true,
  description: "${inputType.docs}",
}`,
        ],
      },
    ],
    properties: inputType.fields.map<
      OptionalKind<PropertyDeclarationStructure>
      >(field => {
      return {
        name: field.name,
        type: field.tsType,
        hasQuestionToken: field.isNullable,
        trailingTrivia: "\r\n",
        decorators: [
          ...[
            ...(inputType.type === InputClasses.create ||
            inputType.type === InputClasses.update ||
            inputType.type === InputClasses.whereUnique
              ? field.validations.map<OptionalKind<DecoratorStructure>>(v => ({
                  name: v.name,
                  arguments: v.text ? [v.text] : [],
                }))
              : []),
          ],
          {
            name: "Field",
            arguments: [
              [
                `_type => ${field.graphqlType},`,
                `{`,
                `nullable: ${field.isNullable},`,
                `description: "${field.docs}"`,
                `}`,
              ].join(" "),
            ],
          },
        ],
      };
    }),
  });

  return sourceFile
}
