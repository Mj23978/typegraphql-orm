import 'reflect-metadata'
import { IsAlpha, IsEmail, MaxLength, MinLength } from 'class-validator';
import { Tog, TogField, TogRelationField } from '../../src/index'
import { TogRole } from './ext-enum';
import { TogMetadata } from './embedded';
import { JsonValue } from 'type-fest';
import { ExcludeFieldFrom } from '../../src/generator/mappers/mapper-types';

@Tog({
  id: true,
  createdAt: true,
  updatedAt: true,
  middlewares: {
    create: ["Authenticate", "Authorize([Role.Customer])"],
    delete: ["Authenticate", "Authorize([Role.Customer])"],
    deleteMany: ["Authenticate", "Authorize([Role.Customer])"],
    findMany: ["Authenticate", "Authorize([Role.Customer])"],
    findUnique: ["Authenticate", "Authorize([Role.Customer])"],
    update: ["Authenticate", "Authorize([Role.Customer])"],
    updateMany: ["Authenticate", "Authorize([Role.Customer])"],
  },
  decorators: [
    {
      name: "Index",
      text: `["lastName", "firstName"]`,
    },
    {
      name: "Unique",
      text: `"unique_email", ["email"]`,
    },
    {
      name: "Unique",
      text: `["email", "id"]`,
    },
    {
      name: "Check",
      text: `
  "check_valid_email","email ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$'"`,
    },
  ],
})
export class TogUser {
  @IsEmail()
  @TogField({ index: true })
  email: string;

  @MinLength(6)
  @MaxLength(25)
  @IsAlpha(undefined, {
    message: "$target $property must containts special charchter : $value",
  })
  @TogField()
  password: string;

  @MinLength(4)
  @MaxLength(35)
  @TogField({ alias: "first_name" })
  firstName?: string;

  @MinLength(2)
  @MaxLength(35)
  @TogField({ alias: "last_name" })
  lastName?: string;

  @MinLength(4)
  @TogField()
  avatar?: string;

  @TogField({ index: true, type: "enum" })
  Role: TogRole;

  @TogField()
  data?: JsonValue;

  @TogField({type: "embedded"})
  metadata?: TogMetadata[];

  @TogField({type: "embedded"})
  privateMetadata?: TogMetadata[];


  @TogField({ hidden: ExcludeFieldFrom.graphql })
  tokenVersion: number = 0;

  @TogRelationField({
    model: "Post",
    modelField: "user",
    type: "o2m",
  })
  posts: TogPost[];
}


@Tog({
  id: true,
  createdAt: true,
  updatedAt: true,
  middlewares: {
    create: ["Authenticate", "Authorize([Role.Customer])"],
    delete: ["Authenticate", "Authorize([Role.Customer])"],
    deleteMany: ["Authenticate", "Authorize([Role.Customer])"],
    findMany: ["Authenticate", "Authorize([Role.Customer])"],
    findUnique: ["Authenticate", "Authorize([Role.Customer])"],
    update: ["Authenticate", "Authorize([Role.Customer])"],
    updateMany: ["Authenticate", "Authorize([Role.Customer])"],
  },
})
export class TogPost {
  @MinLength(4)
  @MaxLength(100)
  @TogField()
  title: string;

  @MinLength(2)
  @MaxLength(75)
  @TogField()
  description?: string;
  
  @TogField()
  text?: string;

  @TogField()
  textJson?: JsonValue;

  @TogField({type: "embedded"})
  metadata?: TogMetadata[];

  @TogField({type: "embedded"})
  privateMetadata?: TogMetadata[];

  @TogRelationField({
    model: "User",
    modelField: "posts",
    type: "m2o",
  })
  user: TogUser;
}
