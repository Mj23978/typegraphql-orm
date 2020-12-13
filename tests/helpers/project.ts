import { CompilerOptions, ModuleKind, Project, ScriptTarget } from "ts-morph";

const baseCompilerOptions: CompilerOptions = {
  target: ScriptTarget.ES2019,
  module: ModuleKind.CommonJS,
  emitDecoratorMetadata: true,
  experimentalDecorators: true,
};

export const testProject = new Project({
  addFilesFromTsConfig: true,
  tsConfigFilePath: "./tests/tsconfig.json",
  compilerOptions: baseCompilerOptions,
});
