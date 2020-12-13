import "reflect-metadata";
import { TogUser } from "./user";
import { IsPhoneNumber, IsPostalCode, MinLength } from "class-validator";
import { Tog, TogField, TogRelationField } from "../generator/decorators/Tog";

@Tog({
  createdAt: true,
  updatedAt: true,
  docs: {
    model: "Test Doc for Model",
    inputs: {
      create: "Test Doc for Input"
    },
    args: {
      findUnique: "Test Doc for Args"
    },
    resolvers: {
      resolver: "Test Doc for Resolvers",
      create: "Test Doc for Create Resolver",
    }
  },
  middlewares: {
    create: ["Authenticate", "Authorize([role.Customer])"],
    delete: ["Authenticate", "Authorize([role.Customer])"],
    deleteMany: ["Authenticate", "Authorize([role.Customer])"],
    findMany: ["Authenticate", "Authorize([role.Customer])"],
    findUnique: ["Authenticate", "Authorize([role.Customer])"],
    update: ["Authenticate", "Authorize([role.Customer])"],
    updateMany: ["Authenticate", "Authorize([role.Customer])"],
  }
})
export class TogAddress {
  @TogField({ type: "pk", docs: "Address ID" })
  id: number;

  @TogField()
  isDefault: boolean;

  @TogField()
  company?: string;

  @MinLength(10)
  @TogField()
  streetAddress: string;

  @MinLength(10)
  @TogField()
  streetAddress2?: string;

  @MinLength(2)
  @TogField()
  city: string;

  @IsPostalCode(undefined, { message: "$value is not a postal code" })
  @TogField({ index: true })
  postalCode: string;

  @MinLength(3)
  @TogField()
  country: string;

  @TogField()
  testList: string[];

  @IsPhoneNumber("ZZ", {
    message:
      "$value is not a phone number (you should follow this format : +(country-code)XXX-XXX-XXXX) ",
  })
  @TogField()
  phone?: string;

  @TogRelationField({ type: "m2o", modelField: "addresses", model: "User" })
  user?: TogUser;
}
