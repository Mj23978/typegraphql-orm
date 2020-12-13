import fs from "fs";
import { togConfigFile } from './strings';
import { TogConfig } from './flags';

export function checkConfigIfExists(file: string): { exists: boolean; data?: any } {
  let exists = false;
  let data;
  if (fs.existsSync(file)) {
    exists = true
    const dataR = fs.readFileSync(file)
    data = JSON.parse(dataR.toString())
  }
  return { exists, data }
}


export function createConfig(): TogConfig {
  const conf = new TogConfig();
  const data = JSON.stringify(conf)
  fs.writeFileSync(`./${togConfigFile}`, data)
  return conf
}