import { SourceFile } from "ts-morph";
import { formatSetting, importPreference } from "../config";

export function createFileGenerator(sourceFile: SourceFile) {
    sourceFile.fixMissingImports(formatSetting, importPreference);
    sourceFile.organizeImports();
    sourceFile.formatText();
    // await sourceFile.save();
}
