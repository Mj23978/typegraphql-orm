import { OptionalKind, MethodDeclarationStructure, Project } from "ts-morph";
import path from "path";

import {
  generateTypeGraphQLImport,
  generateImport,
} from "./import";
import { Action, Model, ModelAction, ModelDocs } from "../mappers/mapper-types";

export default function generateCrudResolver(
  project: Project,
  baseDirPath: string,
  modelName: string,
  modelResolverName: string,
  modelDocs: ModelDocs,
  actions: Action[],
  overwrite: boolean = false,
) {
  const resolverDirPath = path.resolve(baseDirPath, modelName);
  const filePath = path.resolve(resolverDirPath, `${modelResolverName.replace("Resolver", ".resolver")}.ts`);
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
  generateImport(
    sourceFile,
    "./args",
    {
      namedImports: Array.from(new Set(actions
      .filter(it => it.argsTypeName !== undefined)
      .map(it => it.argsTypeName!))),
    }
  );
  generateImport(
    sourceFile,
    "../../models",
    {
      namedImports: [modelName]
    }
  );

  sourceFile.addClass({
    name: modelResolverName,
    isExported: true,
    ...(modelDocs.resolvers?.resolver && {
      docs: [{description: modelDocs.resolvers.resolver}]
    }),
    decorators: [
      {
        name: "Resolver",
        arguments: [`_of => ${modelName}`],
      },
    ],
    methods: actions.map<OptionalKind<MethodDeclarationStructure>>(action =>
      generateCrudResolverMethods(action),
    ),
  });

  return sourceFile
}

function generateCrudResolverMethods(
  action: Action,
): OptionalKind<MethodDeclarationStructure> {
  return {
    name: action.name,
    isAsync: true,
    returnType: `Promise<${action.returnTSType}>`,
    decorators: [
      ...(action.middlewares
        ? [
            {
              name: "UseMiddleware",
              arguments: action.middlewares,
            },
          ]
        : []),
      {
        name: `${action.operation}`,
        arguments: [
          [`_returns => ${action.typeGraphQLType},`,
          `{`,
          `nullable: ${!action},`,
          `description: "${action.docs}"`,
          `}`,].join(" ")
        ],
      },
    ],
    parameters: [
      ...(action.kind === ModelAction.create
        ? [
            {
              name: "ctx",
              type: "GraphqlContext",
              decorators: [{ name: "Ctx", arguments: [] }],
            },
          ]
        : []),
      ...(!action.argsTypeName
        ? []
        : [
            {
              name: "args",
              type: action.argsTypeName,
              decorators: [{ name: "Args", arguments: [] }],
            },
          ]),
    ],
    statements: action.body,
  };
}
