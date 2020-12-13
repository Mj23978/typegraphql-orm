import "reflect-metadata";
import { TogEmbedded, TogField } from "../../src";

@TogEmbedded()
export class TogMetadata {
  @TogField()
  key: string;

  @TogField()
  value: string;
}
