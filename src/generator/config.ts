import { CompilerOptions, FormatCodeSettings, ModuleKind, Project, ScriptTarget, UserPreferences } from 'ts-morph';

const baseCompilerOptions: CompilerOptions = {
  target: ScriptTarget.ES2019,
  module: ModuleKind.CommonJS,
  emitDecoratorMetadata: true,
  experimentalDecorators: true,
};

export const project = new Project({
  addFilesFromTsConfig: true,
  tsConfigFilePath: "./tsconfig.json",
  compilerOptions: baseCompilerOptions,
});

export type BaseKeys = ("model" | "plural");
export const baseKeys: BaseKeys[] = ["model", "plural"];

export type SupportedQueries = (
  "findUnique"  | "findMany"
);
export const supportedQueryActions: SupportedQueries[] = [
  "findUnique",
  "findMany",
];

export type SupportedMutations = (
  "create" | "delete" | "update" | "deleteMany" | "updateMany"
  );
  
export type SupportedOrms = (
  "TypeOrm" | "MikroOrm"
);
export const supportedOrms: SupportedOrms[] = [
  "MikroOrm",
  "TypeOrm"
];

export type SupportedGraphqls = (
  "TypeGraphql"
);
export const supportedGraphqls: SupportedGraphqls[] = [
  "TypeGraphql",
];

export const supportedMutationActions: SupportedMutations[] = [
  "create",
  "delete",
  "update",
  "deleteMany",
  "updateMany",
];

export const modelsFolderName = "models";
export const enumsFolderName = "enums";
export const inputsFolderName = "inputs";
export const resolversFolderName = "resolvers";
export const argsFolderName = "args";

export const importPreference: UserPreferences = {
  importModuleSpecifierPreference: "relative",
};

export const formatSetting: FormatCodeSettings = {
  insertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis: true,
  insertSpaceBeforeFunctionParenthesis: true,
};
