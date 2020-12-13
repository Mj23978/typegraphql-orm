import { Command, flags } from "@oclif/command";
import { args } from "@oclif/parser";
import { dir, file, mainDir } from "../../utils/flags";

export default class Extract extends Command {
  static description = "Extract MetaData And Export to file or log it";

  static examples = [
    `$ tog-cli extract -f=./test.ts

done extracting from ./test.ts :)
`,
  ];

  static flags = {
    help: flags.help({ char: "h" }),
    mainDir: mainDir(),
    dir: dir({ exclusive: ["file"] }),
    file: file({ exclusive: ["dir"] }),
  };

  static args: args.Input = [];

  async run() {
    const { flags } = this.parse(Extract);
    console.log(`done Extracting from ${flags.dir}`)
  }
}
