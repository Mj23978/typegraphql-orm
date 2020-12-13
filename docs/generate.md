`tog-cli generate`
==================

This Command Will Generate Graphql Resolvers, Inputs and Args Types for your Models

* [`tog-cli generate [MODELTYPE]`](#tog-cli-generate-modeltype)
* [`tog-cli generate:add MODEL [MODELTYPE]`](#tog-cli-generateadd-model-modeltype)

## `tog-cli generate [MODELTYPE]`

This Command Will Generate Graphql Resolvers, Inputs and Args Types for your Models

```
USAGE
  $ tog-cli generate [MODELTYPE]

ARGUMENTS
  MODELTYPE  (tog|typeorm|mikroorm) [default: tog] type of decoration your model class have

OPTIONS
  -G, --graphql=TypeGraphql  [default: TypeGraphql] GraphQL Library (default is TypeGraphQL or what is in your
                             togconfig.json)

  -M, --modelsDir=models     [default: models] name of your models directory (default is models or what is in your
                             togconfig.json)

  -O, --orm=TypeOrm          [default: TypeOrm] Orm Library (default is TypeOrm or what is in your togconfig.json)

  -T, --togDir=tog           [default: tog] name of your tog directory (default is tog or what is in your
                             togconfig.json)

  -f, --force

  -h, --help                 show CLI help

  -m, --mainDir=src          [default: src] project main directory (default is src or what is in your togconfig.json)

EXAMPLE
  $ tog-cli generate tog -m=src -T=tog --orm=TypeOrm --graphql=TypeGraphql

  your files are generated :)
```

_See code: [src\commands\generate\index.ts](https://github.com/fluttensor-team/typeorm-graphql/blob/v0.1.0/src\commands\generate\index.ts)_

## `tog-cli generate:add MODEL [MODELTYPE]`

This Command Will Generate: Graphql Resolvers for your Models

```
USAGE
  $ tog-cli generate:add MODEL [MODELTYPE]

ARGUMENTS
  MODEL      Name of Attribute you wannt to add
  MODELTYPE  (tog|typeorm|mikroorm) [default: tog] type of decoration your model class have

OPTIONS
  -G, --graphql=TypeGraphql  [default: TypeGraphql] GraphQL Library (default is TypeGraphQL or what is in your
                             togconfig.json)

  -M, --modelsDir=models     [default: models] name of your models directory (default is models or what is in your
                             togconfig.json)

  -O, --orm=TypeOrm          [default: TypeOrm] Orm Library (default is TypeOrm or what is in your togconfig.json)

  -T, --togDir=tog           [default: tog] name of your tog directory (default is tog or what is in your
                             togconfig.json)

  -f, --force

  -h, --help                 show CLI help

  -m, --mainDir=src          [default: src] project main directory (default is src or what is in your togconfig.json)

EXAMPLE
  $ tog-cli generate:add user tog -m=src -T=tog --orm=TypeOrm --graphql=TypeGraphql

  your files are generated :)
```

_See code: [src\commands\generate\add.ts](https://github.com/fluttensor-team/typeorm-graphql/blob/v0.1.0/src\commands\generate\add.ts)_
