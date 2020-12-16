import { Command, flags } from "@oclif/command";
import { args } from "@oclif/parser";
import { graphql, mainDir, orm, modelsDir, togDir } from "../../utils/flags";
import generateCode from "../../generator/generators/generator";

export default class GenCustom extends Command {
  static description =
    "This Command Will Generate What you want from Graphql Resolvers, Inputs and Args Types and Models";

  static examples = [
    `$ tog-cli generate:custom tog true true true false -m=src -T=tog --orm=TypeOrm --graphql=TypeGraphql

your files are generated :)
`,
  ];

  static flags = {
    help: flags.help({ char: "h" }),
    force: flags.boolean({ char: "f", default: false }),
    verbose: flags.boolean({ char: "v", default: false }),
    mainDir: mainDir(),
    modelsDir: modelsDir({ exclusive: ["togDir"] }),
    togDir: togDir({ exclusive: ["modelsDir"] }),
    orm: orm(),
    graphql: graphql(),
  };

  static args: args.Input = [
    {
      name: "modelType",
      default: "tog",
      options: ["tog", "typeorm", "mikroorm"],
      description: "type of decoration your model class have",
    },
    {
      name: "models",
      default: "true",
      options: ["true", "false"],
      description: "do you want to generate models or not",
      parse: inp => inp === "false" ? false : true 
    },
    {
      name: "args",
      default: "true",
      options: ["true", "false"],
      description: "do you want to generate resolver args or not",
      parse: inp => inp === "false" ? false : true 
    },
    {
      name: "inputs",
      default: "true",
      options: ["true", "false"],
      description: "do you want to generate resolver inputs or not",
      parse: inp => inp === "false" ? false : true 
    },
    {
      name: "resolvers",
      default: "true",
      options: ["true", "false"],
      description: "do you want to generate resolvers or not",
      parse: inp => inp === "false" ? false : true 
    },
  ];

  async run() {
    const { args, flags } = this.parse(GenCustom);
      generateCode(
        flags.mainDir|| "./src",
        `./${flags.mainDir}/${
          args.modelType === "tog" ? flags.togDir : flags.modelsDir
        }`,
        args.modelType === "tog" ? "tog" : "library",
        undefined,
        flags.force,
        true,
        flags.graphql,
        flags.orm,
        flags.verbose,
        args.models,
        args.args,
        args.inputs,
        args.resolvers
      )
  }
}
