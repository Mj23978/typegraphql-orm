`tog-cli extract`
=================

Extract MetaData And Export to file or log it

* [`tog-cli extract`](#tog-cli-extract)
* [`tog-cli extract:models [MODELSDIR]`](#tog-cli-extractmodels-modelsdir)

## `tog-cli extract`

Extract MetaData And Export to file or log it

```
USAGE
  $ tog-cli extract

OPTIONS
  -d, --dir=models      [default: models] directory
  -f, --file=./test.ts  file
  -h, --help            show CLI help
  -m, --mainDir=src     [default: src] project main directory (default is src or what is in your togconfig.json)

EXAMPLE
  $ tog-cli extract -f=./test.ts

  done extracting from ./test.ts :)
```

_See code: [src\commands\extract\index.ts](https://github.com/fluttensor-team/typeorm-graphql/blob/v0.1.0/src\commands\extract\index.ts)_

## `tog-cli extract:models [MODELSDIR]`

Extract MetaData from your models And Export to file or log it

```
USAGE
  $ tog-cli extract:models [MODELSDIR]

OPTIONS
  -d, --dir=models      [default: models] directory
  -f, --file=./test.ts  file
  -h, --help            show CLI help
  -m, --mainDir=src     [default: src] project main directory (default is src or what is in your togconfig.json)

EXAMPLE
  $ tog-cli extract:models -f=./test.ts

  done extracting models from ./test.ts :)
```

_See code: [src\commands\extract\models.ts](https://github.com/fluttensor-team/typeorm-graphql/blob/v0.1.0/src\commands\extract\models.ts)_
