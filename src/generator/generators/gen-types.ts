export interface IGenModel {
  name: string;
  hasJsonValue: boolean;
  docs?: string;
  heritage: string;
  fields: GenField[];
  decorators: GenDecorator[];
}

export class GenModel implements IGenModel {
  name: string;
  hasJsonValue: boolean;
  docs?: string;
  heritage: string;
  decorators: GenDecorator[] = [];
  fields: GenField[] = [];
  inputs: GenInput[] = [];
  args: GenArg[] = [];
  action: GenAction;
}

export class GenEmbModel implements IGenModel {
  name: string;
  hasJsonValue: boolean;
  docs?: string;
  base: boolean;
  heritage: string;
  fields: GenField[] = [];
  decorators: GenDecorator[] = [];
}

export class GenInput {
  name: string;
  hasJsonValue: boolean;
  docs?: string;
  decorators: GenDecorator[] = [];
  fields: GenField[] = [];
}

export class GenAction {
  name: string;
  modelName: string;
  args: string[] = [];
  docs?: string;
  decorators: GenDecorator[] = [];
  methods: GenMethod[] = [];
}

export class GenArg {
  name: string;
  inputs: string[] = [];
  docs?: string;
  decorators: GenDecorator[] = [];
  fields: GenField[] = [];
}

export class GenField {
  name: string;
  default?: string;
  docs?: string;
  isNullable: boolean;
  type: string;
  decorators: GenDecorator[] = [];
}

export class GenMethod {
  name: string
  isAsync: boolean = true
  returnType: string
  decorators: GenDecorator[] = []
  parameters: GenParameter[] = []
  statements: string[] = []
}

export class GenParameter {
  name: string
  type: string
  decorators: GenDecorator[] = []
}

export class GenDecorator {
  name: string;
  arguments: string[];
}
