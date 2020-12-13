import "reflect-metadata";
import { JsonValue } from "type-fest";
import { IsAlpha, IsEmail, MaxLength, MinLength } from "class-validator";
import { Tog, TogField, TogRelationField } from "../generator/decorators/Tog";
import { TogAddress } from "./address";
import { ExcludeFieldFrom } from "../generator/mappers/mapper-types";

/**
 * Test Doc
 */
enum Roles {
  vip = "vip",
  base = "base",
}

@Tog({
  createdAt: true,
  updatedAt: true,
})
export class TogUser {
  @TogField({ type: "pk" })
  id!: number;

  @IsEmail()
  @TogField({ unique: true, index: true })
  email!: string;

  @MinLength(6)
  @MaxLength(25)
  @IsAlpha(undefined, {
    message: "$target $property must containts special charchter : $value",
  })
  @TogField()
  password: string;

  @MinLength(4)
  @MaxLength(35)
  @TogField()
  firstName?: string;

  @MinLength(2)
  @MaxLength(35)
  @TogField()
  lastName?: string;

  @MinLength(4)
  @TogField()
  avatar?: string | null | undefined;

  @TogField({ type: "enum", index: true })
  roles?: Roles;

  @TogField()
  data!: JsonValue;

  @TogField({ hidden: ExcludeFieldFrom.graphql })
  tokenVersion: number = 0;

  @TogRelationField({ type: "o2m",  modelField: "user", model: "Address" })
  addresses: TogAddress[];
}
