import { JsonValue } from "type-fest";
import { Tog, TogField } from '../generator/decorators/Tog';
import { Min, MinLength } from 'class-validator';


@Tog({
  createdAt: true,
  updatedAt: true,
  docs: {
    model: "Test Doc for Model",
    inputs: {
      create: "Test Doc for Input",
    },
    args: {
      findUnique: "Test Doc for Args",
    },
    resolvers: {
      resolver: "Test Doc for Resolvers",
      create: "Test Doc for Create Resolver",
    },
  },
  middlewares: {
    create: ["Authenticate", "Authorize([role.Customer])"],
    delete: ["Authenticate", "Authorize([role.Customer])"],
    deleteMany: ["Authenticate", "Authorize([role.Customer])"],
    findMany: ["Authenticate", "Authorize([role.Customer])"],
    findUnique: ["Authenticate", "Authorize([role.Customer])"],
    update: ["Authenticate", "Authorize([role.Customer])"],
    updateMany: ["Authenticate", "Authorize([role.Customer])"],
  },
})
export class TogProduct {
  @TogField({ type: "pk" })
  id!: number;

  @MinLength(4)
  @TogField({ index: true, unique: true })
  name: string;

  @MinLength(8)
  @TogField()
  description: string;

  @MinLength(3)
  @TogField()
  tags?: string[];

  @MinLength(6)
  @TogField()
  allVariants?: string[];

  @MinLength(6)
  @TogField()
  availableVariants?: string[];

  @Min(0)
  @TogField({ index: true })
  price: number;

  @MinLength(2)
  @TogField()
  currency: string;

  @MinLength(2)
  @TogField({ index: true })
  brand?: string;

  @TogField()
  chargeTax: boolean;

  @Min(0)
  @TogField({index: true, type: "float", })
  weights?: number[];

  @TogField()
  specification!: JsonValue;
}
