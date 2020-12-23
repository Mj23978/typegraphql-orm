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
import { MapperTog } from "../mappers/mapper-tog";
import { ExtEnum } from "../extractors/extractor-types";
import { Project, SourceFile } from "ts-morph";
import { createFileGenerator } from "./helpers";
import { logger } from "../logger";
import { GenEmbModel, GenModel } from "./gen-types";
import { generateCommonInputs } from "./common-inputs";

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
  rawData.enums.push({
    name: "SortOrder",
    members: [{name: "asc", value: "ASC"}, {name: "desc", value: "DESC"}]
  })
  const allModels = new MapperTog(rawData, ormType);

  const allFiles: SourceFile[] = [];
  const modelNames = allModels.modelsOut.map<string>(v => v.name);
  allModels.createFilters(rawData.enums.map<string>(v => v.name.replace("Tog", "")));

  try {
    if (genEnums && genModels) {
      logger.verbose("Generating enums...");
      allFiles.push(
        ...generateEnums(proj, type, overwrite, modelsDirPath, rawData.enums),
      );
    }

    if (justFor && genModels) {
      // generateModelsBarrel(proj, overwrite, modelsDirPath, modelNames);
    } else if (genModels) {
      logger.verbose("Generating models...");
      generateModelsBarrel(proj, overwrite, modelsDirPath, modelNames);
    }
  } catch (err) {
    logger.warn(err);
  }

  logger.verbose("Generating embedded models ...");
  try {
    if (genModels) {
      allFiles.push(
        ...generateEmbeddedModel(
          proj,
          overwrite,
          modelsDirPath,
          allModels.emModelsOut,
          ormType,
        ),
      );
    }
  } catch (err) {
    logger.warn(err);
  }

  logger.verbose("Generating model components..." );
  try {
    if (justFor) {
      allFiles.push(
        ...generateModelComponents(
          proj,
          overwrite,
          modelsDirPath,
          resolversDirPath,
          allModels.modelsOut.filter(v => v.name === justFor),
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
          proj,
          overwrite,
          modelsDirPath,
          resolversDirPath,
          allModels.modelsOut,
          ormType,
          genModels,
          genArgs,
          genInputs,
          genResolvers,
        ),
      );
    }
  } catch (err) {
    logger.warn(err);
  }

  if (!justFor) {
    logger.verbose(`Generating filters...`);
    const inputsPath = path.resolve(resolversDirPath, inputsFolderName);
    const inputsBarrelExportSourceFile = proj.createSourceFile(
      path.resolve(inputsPath, "index.ts"),
      undefined,
      { overwrite },
    );
    generateInputsBarrelFile(inputsBarrelExportSourceFile, [
      ...allModels.filtersOut.map(v => v.name),
      "IndivitualResponse", "BatchPayload"
    ]);

    allModels.filtersOut.forEach(filter => {
      allFiles.push(generateInputType(proj, inputsPath, filter, overwrite));
    });
    generateCommonInputs(proj, inputsPath, overwrite)
  }

  if (!justFor) {
    generateArgsIndex(proj, overwrite, resolversDirPath, modelNames);
    generateIndex(proj, overwrite, resolversDirPath, modelNames);
  }

  allFiles.forEach(file => {
    createFileGenerator(file);
  });
  await proj.save();
}

function generateEnums(
  project: Project,
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
    logger.verbose(`Generating ${v.name} Enum`);
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
  project: Project,
  overwrite: boolean,
  modelsDirPath: string,
  models: GenEmbModel[],
  ormType: SupportedOrms,
) {
  const files: SourceFile[] = [];
  models.forEach(v => {
    logger.verbose(`Generating ${v.name} Embedded Model`);
    files.push(
      generateModelType(project, modelsDirPath, v, ormType, true, overwrite),
    );
  });
  return files;
}

function generateModelsBarrel(
  project: Project,
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
  project: Project,
  overwrite: boolean,
  resolversDirPath: string,
  modelNames: string[],
) {
  logger.verbose("Generating Args index file");
  const argsIndexSourceFile = project.createSourceFile(
    path.resolve(resolversDirPath, "args.index.ts"),
    undefined,
    { overwrite },
  );
  generateArgsIndexFile(argsIndexSourceFile, modelNames);
}

function generateIndex(
  project: Project,
  overwrite: boolean,
  resolversDirPath: string,
  modelNames: string[],
) {
  logger.verbose("Generating index file");
  const indexSourceFile = project.createSourceFile(
    resolversDirPath + "/index.ts",
    undefined,
    { overwrite },
  );
  generateIndexFile(indexSourceFile, modelNames);
}

function generateModelComponents(
  project: Project,
  overwrite: boolean,
  modelsDirPath: string,
  resolversDirPath: string,
  models: GenModel[],
  ormType: SupportedOrms,
  genModels: boolean,
  genArgs: boolean,
  genInputs: boolean,
  genResolvers: boolean,
) {
  const files: SourceFile[] = [];

  models.forEach(model => {
    if (genModels) {
      logger.verbose(`Generating ${model.name} model...`);
      files.push(
        generateModelType(project, modelsDirPath, model, ormType, false, overwrite),
      );
    }

    if (genInputs) {
      logger.verbose(`Generating ${model.name} input types...`);
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
      generateInputsBarrelFile(
        inputsBarrelExportSourceFile,
        model.inputs.map(v => v.name),
      );

      model.inputs.forEach(inputType => {
        files.push(generateInputType(project, inputPath, inputType, overwrite));
      });
    }

    if (genArgs) {
      logger.verbose(`Generating ${model.name} crud resolvers args...`);
      const argsDirPath = path.resolve(resolversDirPath, model.name);
      model.args.forEach(arg => {
        files.push(generateArgsType(project, argsDirPath, arg, overwrite));
      });
      const barrelExportSourceFile = project.createSourceFile(
        path.resolve(argsDirPath, argsFolderName, "index.ts"),
        undefined,
        { overwrite },
      );
      generateArgsBarrelFile(
        barrelExportSourceFile,
        model.args.map<string>(v => v.name),
      );
    }

    if (genResolvers) {
      logger.verbose(`Generating ${model.name} crud resolvers...`);
      files.push(
        generateCrudResolver(
          project,
          resolversDirPath,
          model.action,
          overwrite,
        ),
      );
      const crudResolversIndexSourceFile = project.createSourceFile(
        path.resolve(resolversDirPath, model.name, "index.ts"),
        undefined,
        { overwrite },
      );
      generateResolversIndexFile(
        crudResolversIndexSourceFile,
        model.action.name,
      );
    }
  });

  return files;
}
