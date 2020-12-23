import "reflect-metadata";
import { promises as fs } from "fs";

import generateArtifactsDirPath from "./artifacts-dir";
import { exctractData } from "../../src/generator/extractors/extractor";
import { testProject } from "./project";
import path from "path";
import { MapperTog } from "../../src/generator/mappers/mapper-tog";

describe("test mapping models", () => {
  let outputDirPath: string;

  beforeEach(async () => {
    outputDirPath = generateArtifactsDirPath("mapping-data");
    await fs.mkdir(outputDirPath, { recursive: true });
  });

  it("should properly map extracted models to right models, args, inputs, resolvers and ..", async () => {
    const dir = path.resolve(__dirname, "..", "files");
    const rawData = exctractData(testProject, dir);
    const models = new MapperTog(rawData, "MikroOrm")
  });
});
