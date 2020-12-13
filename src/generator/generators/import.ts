import {
  SourceFile,
  OptionalKind,
  ExportDeclarationStructure,
  ImportDeclaration,
} from "ts-morph";
import path from "path";

import {
  modelsFolderName,
  enumsFolderName,
  inputsFolderName,
  argsFolderName,
  // relationsResolversFolderName,
} from "../config";

type ImportsOption = {
  defaultImport?: string | undefined;
  namespaceImport?: string | undefined;
  namedImports?: string[];
};

export function getImport(
  sourceFile: SourceFile,
  moduleName: string,
): ImportDeclaration | undefined {
  const imp = sourceFile.getImportDeclaration(
    imp => imp.getModuleSpecifierValue() === moduleName,
  );
  return imp;
}

export function generateImport(
  sourceFile: SourceFile,
  moduleName: string,
  options: ImportsOption,
) {
  if (getImport(sourceFile, moduleName) === undefined) {
    sourceFile.addImportDeclaration({
      moduleSpecifier: moduleName,
      ...options,
    });
  }
}

export function generateTypeGraphQLImport(
  sourceFile: SourceFile,
  imports: string[],
) {
  generateImport(sourceFile, "type-graphql", { namedImports: imports });
}

export function generateTypeOrmImport(sourceFile: SourceFile) {
  const imports = ["Column", "Entity"];
  generateImport(sourceFile, "typeorm", { namedImports: imports });
}

export function generateMikroOrmImport(sourceFile: SourceFile) {
  const imports = ["Entity", "Property"];
  generateImport(sourceFile, "@mikro-orm/core", { namedImports: imports });
}

export function generateGraphQLFieldsImport(sourceFile: SourceFile) {
  generateImport(sourceFile, "graphql-fields", {
    namespaceImport: "graphqlFields",
  });
  generateImport(sourceFile, "graphql", {
    namedImports: ["GraphQLResolveInfo"],
  });
}

export function generateGraphQLJsonImport(sourceFile: SourceFile) {
  generateImport(sourceFile, "graphql-type-json", {
    defaultImport: "GraphQLJSON",
  });
  generateImport(sourceFile, "type-fest", {
    namedImports: ["JsonValue"],
  });
}

export function generateArgsBarrelFile(
  sourceFile: SourceFile,
  argsTypeNames: string[],
) {
  sourceFile.addExportDeclarations(
    argsTypeNames
      .sort()
      .map<OptionalKind<ExportDeclarationStructure>>(argTypeName => ({
        moduleSpecifier: `./${argTypeName.replace("Args", ".args")}`,
        namedExports: [argTypeName],
      })),
  );
}

export function generateModelsBarrelFile(
  sourceFile: SourceFile,
  modelNames: string[],
) {
  sourceFile.addExportDeclarations(
    modelNames
      .sort()
      .map<OptionalKind<ExportDeclarationStructure>>(modelName => ({
        moduleSpecifier: `./${modelName}.entity`,
        namedExports: [modelName],
      })),
  );
}

export function generateEnumsBarrelFile(
  sourceFile: SourceFile,
  enumTypeNames: string[],
) {
  sourceFile.addExportDeclarations(
    enumTypeNames
      .sort()
      .map<OptionalKind<ExportDeclarationStructure>>(enumTypeName => ({
        moduleSpecifier: `./${enumTypeName}`,
        namedExports: [enumTypeName],
      })),
  );
}

export function generateInputsBarrelFile(
  sourceFile: SourceFile,
  inputTypeNames: string[],
) {
  sourceFile.addExportDeclarations(
    inputTypeNames
      .sort()
      .map<OptionalKind<ExportDeclarationStructure>>(inputTypeName => ({
        moduleSpecifier: `./${inputTypeName.replace("Input", ".input")}`,
        namedExports: [inputTypeName],
      })),
  );
}

export function generateArgsIndexFile(
  sourceFile: SourceFile,
  typeNames: string[],
) {
  sourceFile.addExportDeclarations(
    typeNames
      .sort()
      .map<OptionalKind<ExportDeclarationStructure>>(typeName => ({
        moduleSpecifier: `./${typeName}/args`,
      })),
  );
}

export function generateIndexFile(
  sourceFile: SourceFile,
  models: string[],
  // hasSomeRelations: boolean = false,
) {
  sourceFile.addExportDeclarations([
    ...models.map<OptionalKind<ExportDeclarationStructure>>(modelName => ({
      moduleSpecifier: `./${modelName}`,
    })),
  ]);

  sourceFile.addExportDeclarations([
    {moduleSpecifier: `./inputs`},
  ]);

  // sourceFile.addImportDeclarations([
  //   {
  //     moduleSpecifier: `type-graphql`,
  //     namedImports: ["NonEmptyArray"],
  //   },
  //   ...models.map<OptionalKind<ImportDeclarationStructure>>(v => ({
  //     moduleSpecifier: `./${resolversFolderName}/${v}/resolvers-crud.index`,
  //   })),
  // ]);

  // sourceFile.addVariableStatement({
  //   isExported: true,
  //   declarationKind: VariableDeclarationKind.Const,
  //   declarations: [
  //     {
  //       name: "crudResolvers",
  //       initializer: `Object.values(crudResolversImport) as unknown as NonEmptyArray<Function>`,
  //     },
  //   ],
  // });

  // if (hasSomeRelations) {
  //   sourceFile.addVariableStatement({
  //     isExported: true,
  //     declarationKind: VariableDeclarationKind.Const,
  //     declarations: [
  //       {
  //         name: "relationResolvers",
  //         initializer: `Object.values(relationResolversImport) as unknown as NonEmptyArray<Function>`,
  //       },
  //     ],
  //   });
  // }

  // sourceFile.addVariableStatement({
  //   isExported: true,
  //   declarationKind: VariableDeclarationKind.Const,
  //   declarations: [
  //     {
  //       name: "resolvers",
  //       initializer: `[...crudResolvers${
  //         hasSomeRelations ? ", ...relationResolvers" : ""
  //       }] as unknown as NonEmptyArray<Function>`,
  //     },
  //   ],
  // });

}

export function generateResolversIndexFile(
  sourceFile: SourceFile,
  // type: "crud" | "relations",
  modelResolverName: string,
) {
  // if (type === "crud") {
  sourceFile.addExportDeclarations([
    {
      moduleSpecifier: `./${modelResolverName.replace(
        "Resolver",
        ".resolver",
      )}`,
      namedExports: [`${modelResolverName}`],
    },
  ]);
  // } else {
  //   sourceFile.addExportDeclarations([
  //     { moduleSpecifier: `./resolvers.index` },
  //   ]);
  // }
  sourceFile.addExportDeclarations([{ moduleSpecifier: `./args` }]);
  sourceFile.addExportDeclarations([{ moduleSpecifier: `./inputs` }]);
  // }
}

function createImportGenerator(elementsDirName: string) {
  return (sourceFile: SourceFile, elementsNames: string[], level = 1) => {
    const distinctElementsNames = [...new Set(elementsNames)].sort();
    for (const elementName of distinctElementsNames) {
      sourceFile.addImportDeclaration({
        moduleSpecifier:
          (level === 0 ? "./" : "") +
          path.posix.join(
            ...Array(level).fill(".."),
            elementsDirName,
            elementName,
          ),
        // TODO: refactor to default exports
        // defaultImport: elementName,
        namedImports: [elementName],
      });
    }
  };
}

export const generateModelsImports = createImportGenerator(modelsFolderName);
export const generateEnumsImports = createImportGenerator(enumsFolderName);
export const generateInputsImports = createImportGenerator(inputsFolderName);
export const generateArgsImports = createImportGenerator(argsFolderName);
