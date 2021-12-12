# TypeGraphQL + Any Orm !!

This Repo is a Cli that Creates Models and Crud Resolvers for orm and typegraphql stack 
(currently typeorm and mikroorm)

## Installation

Fist of all, you have to install the generator, as a dev dependency:

```sh
npm i -D @mj23978/simple-generator
```

Furthermore, `simple-generator`  requires Typegraphql & Typeorm to work properly, so please install Prisma dependencies if you don't have it already installed:

You also need to install the GraphQL JSON scalar library (to support the Prisma `Json` scalar):

```sh
npm i graphql-type-json
```

as well as the `graphql-fields` that is used to properly support the aggregations queries:

```sh
npm i graphql-fields @types/graphql-fields
```

## Usage

Given that you have this part of datamodel definitions:

```typescript
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
```

It will generate a `User` class in the output folder, with TypeGraphQL decorators, and an enum - you can import them and use normally as a type or an explicit type in your resolvers:

```ts
export enum PostKind {
  BLOG = "BLOG",
  ADVERT = "ADVERT",
}
TypeGraphQL.registerEnumType(PostKind, {
  name: "PostKind",
  description: undefined,
});

@TypeGraphQL.ObjectType({
  isAbstract: true,
  description: undefined,
})
export class Post {
  @TypeGraphQL.Field(_type => String, {
    nullable: false,
    description: undefined,
  })
  id!: string;

  @TypeGraphQL.Field(_type => String, {
    nullable: false,
    description: undefined,
  })
  email!: string;

  @TypeGraphQL.Field(_type => String, {
    nullable: true,
    description: undefined,
  })
  name?: string | null;

  posts?: Post[] | null;
}
```

- findOne
- create
- update
- delete
- findMany
- updateMany
- deleteMany

By default, the method names will be mapped to a GraphQL idiomatic ones (like `findManyPost` -> `posts`).
You can opt-in to use original names by providing `useOriginalMapping = true` generator option.

Also, if you want to have relations like `User -> posts` emitted in schema, you need to import the relations resolvers and register them in your `buildSchema` call:

```ts
import {
  User,
  UserRelationsResolver,
  UserCrudResolver,
} from "@generated/type-graphql";

const schema = await buildSchema({
  resolvers: [CustomUserResolver, UserRelationsResolver, UserCrudResolver],
  validate: false,
});
```

All generated CRUD and relations resolvers fully support this feature and they map under the hood the original prisma property to the renamed field exposed in schema.

The same goes to the resolvers input types - they will also be emitted with changed field name, e.g.:

```graphql
input UserCreateInput {
  emailAddress: String!
  posts: PostCreateManyWithoutAuthorInput
}
```

The emitted input type classes automatically map the provided renamed field values from GraphQL query into proper Prisma input properties out of the box.
