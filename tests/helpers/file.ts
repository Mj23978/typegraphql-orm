import { promises as fs } from "fs";

export type ReadGeneratedFile = (filePath: string) => Promise<string>;
export type WriteGeneratedFile = (filePath: string) => Promise<any>;

export function readGeneratedFile(
  baseDirPath: string,
): ReadGeneratedFile {
  return (filePath: string) =>
    fs.readFile(baseDirPath + filePath, { encoding: "utf8" });
}

export function writeGeneratedFile(
  baseDirPath: string,
  data: Buffer
): WriteGeneratedFile {
  return (filePath: string) => fs.writeFile(baseDirPath + filePath, data, { encoding: "utf8" });
}
