import { Command, flags } from "@oclif/command";
import { args } from "@oclif/parser";
import { graphql, mainDir, orm, modelsDir, togDir } from "../../utils/flags";
import generateCode from "../../generator/generators/generator";

export default class GenAdd extends Command {
  static description =
    "This Command Will Generate: Graphql Resolvers for your Models";

  static examples = [
    `$ tog-cli generate:add user tog -m=src -T=tog --orm=TypeOrm --graphql=TypeGraphql

your files are generated :)
`,
  ];

  static flags = {
    help: flags.help({ char: "h" }),
    force: flags.boolean({ char: "f", default: false }),
    mainDir: mainDir(),
    modelsDir: modelsDir({ exclusive: ["togDir"] }),
    togDir: togDir({ exclusive: ["modelsDir"] }),
    orm: orm(),
    graphql: graphql(),
  };

  static args: args.Input = [
    {
      name: "model",
      description: "Name of Attribute you wannt to add",
      required: true,
    },
    {
      name: "modelType",
      default: "tog",
      options: ["tog", "typeorm", "mikroorm"],
      description: "type of decoration your model class have",
    },
  ];

  async run() {
    const { args, flags } = this.parse(GenAdd);
    generateCode(
      flags.mainDir || "./src",
      `./${flags.mainDir}/${
        args.modelType === "tog" ? flags.togDir : flags.modelsDir
      }`,
      args.modelType === "tog" ? "tog" : "library",
      args.attribute,
      flags.force,
      false,
    );
  }
}
