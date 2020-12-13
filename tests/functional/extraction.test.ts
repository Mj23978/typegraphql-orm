import "reflect-metadata";
import { promises as fs } from "fs";

import generateArtifactsDirPath from "../helpers/artifacts-dir";
import { exctractData } from "../../src/generator/extractors/extractor";
import { testProject } from "../helpers/project";
import path from "path";

describe("test extracting models", () => {
  let outputDirPath: string;

  beforeEach(async () => {
    outputDirPath = generateArtifactsDirPath("extracting-data");
    await fs.mkdir(outputDirPath, { recursive: true });
  });

  it("should properly extract models, enums and ... from tog files", async () => {
    const dir = path.resolve(__dirname, "..", "files");
    await fs.writeFile(outputDirPath + "/data.ts", `${JSON.stringify(exctractData(testProject, dir))}`)
  });
});
