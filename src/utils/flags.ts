import { flags } from "@oclif/command";
import { SupportedGraphqls, supportedGraphqls, supportedOrms, SupportedOrms } from '../generator/config';
import { checkConfigIfExists, createConfig } from "./check-config";
import { togConfigFile } from './strings';

export const mainDir = flags.build<string>({
  char: "m",
  description:
    `project main directory (default is src or what is in your ${togConfigFile})`,
  default: () => getConfig().mainDir,
  helpValue: "src",
  multiple: false,
  parse: input => input,
});

export const modelsDir = flags.build<string>({
  char: "M",
  description:
    `name of your models directory (default is models or what is in your ${togConfigFile})`,
  default: () => getConfig().modelsDir,
  helpValue: "models",
  multiple: false,
  parse: input => input,
});

export const togDir = flags.build<string>({
  char: "T",
  description:
    `name of your tog directory (default is tog or what is in your ${togConfigFile})`,
  default: () => getConfig().togDir,
  helpValue: "tog",
  multiple: false,
  parse: input => input,
});

export const dir = flags.build<string>({
  char: "d",
  description: "directory",
  default: () => "models",
  helpValue: "models",
  multiple: false,
  parse: input => input,
});

export const file = flags.build<string>({
  char: "f",
  description: "file",
  helpValue: "./test.ts",
  multiple: false,
  parse: input => input,
});

export const orm = flags.build<SupportedOrms>({
  char: "O",
  description:
    `Orm Library (default is TypeOrm or what is in your ${togConfigFile})`,
  default: () => getConfig().orm,
  options: supportedOrms,
  helpValue: "TypeOrm",
  multiple: false,
  parse: input =>
    input === "MikroOrm"
      ? "MikroOrm"
      : "TypeOrm",
});

export const graphql = flags.build<SupportedGraphqls>({
  char: "G",
  description:
    `GraphQL Library (default is TypeGraphQL or what is in your ${togConfigFile})`,
  default: () => getConfig().graphql,
  options: supportedGraphqls,
  helpValue: "TypeGraphql",
  multiple: false,
  parse: input => "TypeGraphql",
});

export function getConfig(): TogConfig {
  const tsConf = checkConfigIfExists("./package.json");
  const togConf = checkConfigIfExists(`./${togConfigFile}`);
  if (!tsConf.exists) {
    throw new Error("You Should run this command at the root of your project");
  }
  if (!togConf.exists) {
    return createConfig();
  }
  const res = new TogConfig();
  res.mainDir = togConf.data.mainDir ? togConf.data.mainDir : "src";
  res.togDir = togConf.data.togDir ? togConf.data.togDir : "tog";
  res.modelsDir = togConf.data.modelsDir ? togConf.data.modelsDir : "models";
  res.graphql = togConf.data.graphql ? togConf.data.graphql : "TypeGraphql";
  res.orm = togConf.data.orm ? togConf.data.orm : "TypeOrm";
  return res;
}

export class TogConfig {
  mainDir: string = "src";
  modelsDir: string = "models";
  togDir: string = "tog";
  orm: SupportedOrms;
  graphql: SupportedGraphqls;
}
