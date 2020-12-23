// BatchPayload - IndivitualResponse - Context -
import { Project } from "ts-morph";
import path from "path";
import { generateTypeGraphQLImport } from "./import";

export function generateCommonInputs(
  project: Project,
  dirPath: string,
  overwrite: boolean = false,
) {
  const batchPath = path.resolve(dirPath, "BatchPayload.ts");
  const indivPath = path.resolve(dirPath, "IndivitualResponse.ts");
  const batchFile = project.createSourceFile(batchPath, undefined, {
    overwrite,
  });
  const indivFile = project.createSourceFile(indivPath, undefined, {
    overwrite,
  });

  generateTypeGraphQLImport(batchFile, ["Field", "ObjectType", "Int"]);
  generateTypeGraphQLImport(indivFile, ["Field", "ObjectType", "Int"]);

  batchFile.addClass({
    name: "BatchPayload",
    isExported: true,
    decorators: [
      {
        name: "ObjectType",
        arguments: [
          `{
  isAbstract: true,
  description: undefined,
}`,
        ],
      },
    ],
    properties: [
      {
        name: "count",
        type: "number",
        hasQuestionToken: false,
        trailingTrivia: "\r\n",
        decorators: [
          {
            name: "Field",
            arguments: [
              [
                `_type => Int,`,
                `{`,
                `nullable: false,`,
                `description: undefined`,
                `}`,
              ].join(" "),
            ],
          },
        ],
      },
    ],
  });

  indivFile.addClass({
    name: "IndivitualResponse",
    isExported: true,
    decorators: [
      {
        name: "ObjectType",
        arguments: [
          `{
  isAbstract: true,
  description: undefined,
}`,
        ],
      },
    ],
    properties: [
      {
        name: "succesful",
        type: "boolean",
        hasQuestionToken: false,
        trailingTrivia: "\r\n",
        decorators: [
          {
            name: "Field",
            arguments: [
              [
                `{`,
                `nullable: false`,
                `}`,
              ].join(" "),
            ],
          },
        ],
      },
      {
        name: "error",
        type: "string",
        hasQuestionToken: true,
        trailingTrivia: "\r\n",
        decorators: [
          {
            name: "Field",
            arguments: [
              [
                `{`,
                `nullable: true`,
                `}`,
              ].join(" "),
            ],
          },
        ],
      },
    ],
  });
}
