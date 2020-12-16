import path from "path";

import generateEnum from "./enum-type";
import generateModelType from "./model-type";
import { generateInputType } from "./input-type";
import generateCrudResolver from "./crud-resolvers";
import {
  resolversFolderName,
  inputsFolderName,
  enumsFolderName,
  modelsFolderName,
  argsFolderName,
  project,
  SupportedGraphqls,
  SupportedOrms,
} from "../config";
import {
  generateInputsBarrelFile,
  generateIndexFile,
  generateModelsBarrelFile,
  generateEnumsBarrelFile,
  generateArgsBarrelFile,
  generateArgsIndexFile,
  generateResolversIndexFile,
} from "./import";
import generateArgsType from "./args-type";
import { exctractData } from "../extractors/extractor";
import { mapperTog } from "../mappers/mapper-tog";
import {
  createActions,
  createArgTypes,
  createInputTypes,
} from "../mappers/map-components";
import { ExtData, ExtEnum } from "../extractors/extractor-types";
import { EmbeddedModel, Model } from "../mappers/mapper-types";
import generateEmbeddedModelType from "./embedded-type";
import { Project, SourceFile } from "ts-morph";
import { createFileGenerator } from "./helpers";
import { logger, loggerOptions } from "../logger";

export default async function generateCode(
  baseDir: string,
  togDir: string,
  type: "tog" | "library",
  justFor?: string,
  overwrite: boolean = false,
  genEnums: boolean = true,
  graphqlType: SupportedGraphqls = "TypeGraphql",
  ormType: SupportedOrms = "TypeOrm",
  isVerbose: boolean = false,
  genModels: boolean = true,
  genArgs: boolean = true,
  genInputs: boolean = true,
  genResolvers: boolean = true,
  proj: Project = project,
) {
  // logger.configure({
  //   level: isVerbose ? "verbose" : "info",
  //   ...loggerOptions
  // })
  const resolversDirPath = path.resolve(baseDir, resolversFolderName);
  const modelsDirPath = path.resolve(baseDir, modelsFolderName);

  const rawData = exctractData(proj, togDir);
  const allModels = mapperTog(rawData, ormType);

  const allFiles: SourceFile[] = [];
  const modelNames = allModels.models.map<string>(v => v.name);

  try {
    if (genEnums && genModels) {
      logger.log({ level: "verbose", message: "Generating enums..." });
      allFiles.push(
        ...generateEnums(type, overwrite, modelsDirPath, rawData.enums),
      );
    }

    if (justFor && genModels) {
      // generateModelsBarrel(overwrite, modelsDirPath, modelNames);
    } else if (genModels) {
      logger.log({ level: "verbose", message: "Generating models..." });
      generateModelsBarrel(overwrite, modelsDirPath, modelNames);
    }
  } catch (err) {
    logger.log({ level: "verbose", message: err });
  }

  logger.log({ level: "verbose", message: "Generating embedded models ..." });
  try {
    if (genModels) {
      allFiles.push(
        ...generateEmbeddedModel(
          overwrite,
          modelsDirPath,
          allModels.embeddedModels,
          ormType,
        ),
      );
    }
  } catch (err) {
    logger.log({ level: "verbose", message: err });
  }

  logger.log({ level: "verbose", message: "Generating model components..." });
  try {
    if (justFor) {
      allFiles.push(
        ...generateModelComponents(
          overwrite,
          modelsDirPath,
          resolversDirPath,
          allModels.models.filter(v => v.name === justFor),
          ormType,
          genModels,
          genArgs,
          genInputs,
          genResolvers,
        ),
      );
    } else {
      allFiles.push(
        ...generateModelComponents(
          overwrite,
          modelsDirPath,
          resolversDirPath,
          allModels.models,
          ormType,
          genModels,
          genArgs,
          genInputs,
          genResolvers,
        ),
      );
    }
  } catch (err) {
    logger.log({ level: "verbose", message: err });
  }

  if (!justFor) {
    generateArgsIndex(overwrite, resolversDirPath, modelNames);
    generateIndex(overwrite, resolversDirPath, modelNames);
  }

  allFiles.forEach(file => {
    createFileGenerator(file);
  });
  await project.save();
}

function generateEnums(
  type: "tog" | "library",
  overwrite: boolean,
  modelsDirPath: string,
  enums: ExtEnum[],
) {
  const files: SourceFile[] = [];
  if (type === "tog") {
    const enumsBarrelExportSourceFile = project.createSourceFile(
      path.resolve(modelsDirPath, enumsFolderName, "index.ts"),
      undefined,
      { overwrite },
    );
    generateEnumsBarrelFile(
      enumsBarrelExportSourceFile,
      enums.map<string>(v => v.name),
    );
  }
  enums.forEach(v => {
    logger.log({ level: "verbose", message: `Generating ${v.name} Enum` });
    files.push(
      generateEnum(
        project,
        modelsDirPath,
        v,
        type === "tog" ? true : false,
        overwrite,
      ),
    );
  });

  return files;
}

function generateEmbeddedModel(
  overwrite: boolean,
  modelsDirPath: string,
  models: EmbeddedModel[],
  ormType: SupportedOrms,
) {
  const files: SourceFile[] = [];
  models.forEach(v => {
    logger.log({
      level: "verbose",
      message: `Generating ${v.name} Embedded Model`,
    });
    files.push(
      generateEmbeddedModelType(project, modelsDirPath, v, ormType, overwrite),
    );
  });
  return files;
}

function generateModelsBarrel(
  overwrite: boolean,
  modelsDirPath: string,
  modelNames: string[],
) {
  const modelsBarrelExportSourceFile = project.createSourceFile(
    path.resolve(modelsDirPath, "index.ts"),
    undefined,
    { overwrite },
  );
  generateModelsBarrelFile(modelsBarrelExportSourceFile, modelNames);
}

function generateArgsIndex(
  overwrite: boolean,
  resolversDirPath: string,
  modelNames: string[],
) {
  logger.log({ level: "verbose", message: "Generating Args index file" });
  const argsIndexSourceFile = project.createSourceFile(
    path.resolve(resolversDirPath, "args.index.ts"),
    undefined,
    { overwrite },
  );
  generateArgsIndexFile(argsIndexSourceFile, modelNames);
}

function generateIndex(
  overwrite: boolean,
  resolversDirPath: string,
  modelNames: string[],
) {
  logger.log({ level: "verbose", message: "Generating index file" });
  const indexSourceFile = project.createSourceFile(
    resolversDirPath + "/index.ts",
    undefined,
    { overwrite },
  );
  generateIndexFile(indexSourceFile, modelNames);
}

function generateModelComponents(
  overwrite: boolean,
  modelsDirPath: string,
  resolversDirPath: string,
  models: Model[],
  ormType: SupportedOrms,
  genModels: boolean,
  genArgs: boolean,
  genInputs: boolean,
  genResolvers: boolean,
) {
  const files: SourceFile[] = [];

  models.forEach(model => {
    if (genModels) {
      logger.log({
        level: "verbose",
        message: `Generating ${model.name} model...`,
      });
      files.push(
        generateModelType(project, modelsDirPath, model, ormType, overwrite),
      );
    }

    if (genInputs) {
      logger.log({
        level: "verbose",
        message: `Generating ${model.name} input types...`,
      });
      const inputPath = path.resolve(
        resolversDirPath,
        model.name,
        inputsFolderName,
      );
      const inputsBarrelExportSourceFile = project.createSourceFile(
        path.resolve(inputPath, "index.ts"),
        undefined,
        { overwrite },
      );
      const inputTypes = createInputTypes(model.name, [...model.fields, ...model.embeddedFields], model.docs);
      generateInputsBarrelFile(
        inputsBarrelExportSourceFile,
        inputTypes.map(v => v.typeName),
      );

      inputTypes.forEach(inputType => {
        files.push(generateInputType(project, inputPath, inputType, overwrite));
      });
    }

    if (genArgs) {
      logger.log({
        level: "verbose",
        message: `Generating ${model.name} crud resolvers args...`,
      });
      const argsDirPath = path.resolve(resolversDirPath, model.name);
      const argTypes = createArgTypes(model.name, model.docs);
      argTypes.forEach(arg => {
        files.push(
          generateArgsType(
            project,
            argsDirPath,
            arg,
            overwrite,
            model.hasJsonValue,
          ),
        );
      });
      const barrelExportSourceFile = project.createSourceFile(
        path.resolve(argsDirPath, argsFolderName, "index.ts"),
        undefined,
        { overwrite },
      );
      generateArgsBarrelFile(
        barrelExportSourceFile,
        argTypes.map<string>(v => v.name),
      );
    }

    if (genResolvers) {
      logger.log({
        level: "verbose",
        message: `Generating ${model.name} crud resolvers...`,
      });
      const actions = createActions(
        model.name,
        model.plural,
        model.middlewares,
        model.docs,
        ormType,
      );
      files.push(
        generateCrudResolver(
          project,
          resolversDirPath,
          model.name,
          model.resolverName,
          model.docs,
          actions,
          overwrite,
        ),
      );
      // const crudResolversBarrelExportSourceFile = project.createSourceFile(
      //   path.resolve(resolversDirPath, "resolvers-crud.index.ts"),
      //   undefined,
      //   { overwrite },
      // );
      const crudResolversIndexSourceFile = project.createSourceFile(
        path.resolve(resolversDirPath, model.name, "index.ts"),
        undefined,
        { overwrite },
      );
      generateResolversIndexFile(
        crudResolversIndexSourceFile,
        model.resolverName,
      );
    }
  });

  return files;
}
