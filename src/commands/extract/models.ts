import { Command, flags } from "@oclif/command";
import { args } from "@oclif/parser";
import { dir, file, mainDir } from "../../utils/flags";

export default class ExtractModels extends Command {
  static description =
    "Extract MetaData from your models And Export to file or log it";

  static examples = [
    `$ tog-cli extract:models -f=./test.ts

done extracting models from ./test.ts :)
`,
  ];

  static flags = {
    help: flags.help({ char: "h" }),
    mainDir: mainDir(),
    dir: dir({ exclusive: ["file"] }),
    file: file({ exclusive: ["dir"] }),
  };

  static args: args.Input = [{ name: "modelsDir", default: "models" }];

  async run() {
    const { flags } = this.parse(ExtractModels);
    console.log(`done Extracting from ${flags.dir}`);
  }
}
