import {
  ArrayLiteralExpression,
  ArrayTypeNode,
  ArrowFunction,
  ClassDeclaration,
  Decorator,
  FunctionExpression,
  Node,
  ObjectLiteralExpression,
  Project,
  PropertyAssignment,
  PropertyDeclaration,
  SourceFile,
  StringLiteral,
  SyntaxKind,
  UnionTypeNode,
} from "ts-morph";
import { TogFieldOptions } from "../decorators/options/TogFieldOptions";

import {
  ExtData,
  ExtModel,
  ExtProperty,
  ExtDecorator,
  ExtPropType,
  TsTypes,
  ImportModel,
  ExtEnum,
} from "./extractor-types";

export function exctractData(
  project: Project,
  dir: string = "./src/tog",
): ExtData {
  const data = new ExtData();

  const files = project.getSourceFiles(`${dir}/**/*.ts`);
  for (const file of files) {
    data.models.push(...getClasses(file));
    data.imports.push(...getImports(file));
  }
  const modelAndEnums = addEnumToProps(data.models, files);
  data.enums = modelAndEnums.enumsRes;
  data.models = modelAndEnums.modelsRes;
  return data;
}

export function getClasses(file: SourceFile): ExtModel[] {
  const res: ExtModel[] = [];
  const classes = file.getClasses();
  for (const cls of classes) {
    const model = new ExtModel();
    model.name = getName(cls);
    model.decorators = getDecorators(cls).res;
    model.properties = getProperties(cls);
    for (const her of cls.getHeritageClauses()) {
      model.heritages.push(her.getText());
    }
    res.push(model);
  }
  return res;
}

export function getImports(file: SourceFile): ImportModel[] {
  const res: ImportModel[] = [];
  const imports = file.getImportDeclarations();
  for (const imp of imports) {
    const impor = new ImportModel();
    impor.moduleName = imp.getModuleSpecifierValue();
    impor.defaultImport = imp.getDefaultImport()?.getText();
    impor.namedImports = imp.getNamedImports().map<string>(v => v.getText());
    res.push(impor);
  }
  return res;
}

export function getProperties(cls: ClassDeclaration): ExtProperty[] {
  const res: ExtProperty[] = [];
  const props = cls.getProperties();
  for (const prop of props) {
    const property = new ExtProperty();
    property.name = getName(prop);
    const decrs = getDecorators(prop);
    property.decorators = decrs.res;
    const getP = getPropTypes(prop);
    property.type = getP.res;
    if (decrs.isEnum) {
      property.type.type = "enum";
    }
    property.isNullable = getP.isNullable;
    property.isList = getP.isList;
    res.push(property);
  }
  return res;
}

export function getDecorators(
  input: ClassDeclaration | PropertyDeclaration,
): { res: ExtDecorator[]; isEnum: boolean } {
  const res: ExtDecorator[] = [];
  const decorators = input.getDecorators();
  for (const decr of decorators) {
    const text = decr.getExpression().getText();
    const decorator = new ExtDecorator();
    decorator.name = decr.getFullName();
    decorator.properties = getDecoratorArgs(decr);
    decorator.propText = text.substring(
      decorator.name.length + 1,
      text.length - 1,
    );
    res.push(decorator);
  }
  let isEnum = false;
  const field = res.filter(v => v.name === "TogField");
  if (field.length === 1) {
    if (field[0].properties[0]) {
      const props = field[0].properties[0] as TogFieldOptions;
      if (props.type === "enum") {
        isEnum = true;
      }
    }
  }
  return { res, isEnum };
}

export function getDecoratorArgs(decr: Decorator): any[] {
  const res: any[] = [];
  const args = decr.getArguments();
  for (const arg of args) {
    switch (arg.getKind()) {
      case SyntaxKind.ObjectLiteralExpression:
        const objArg = arg as ObjectLiteralExpression;
        res.push(getSimpleProperties(objArg));
        break;
      case SyntaxKind.ArrowFunction:
        const arArg = arg as ArrowFunction;
        res.push(handleFunctions(arArg));
        break;
      case SyntaxKind.ArrayLiteralExpression:
        const arrayArg = arg as ArrayLiteralExpression;
        res.push(JSON.parse(arrayArg.getText()));
        break;
      case SyntaxKind.FunctionExpression:
        const funcArg = arg as FunctionExpression;
        res.push(handleFunctions(funcArg));
        break;
      case SyntaxKind.StringLiteral:
        const strArg = arg as StringLiteral;
        res.push(JSON.parse(strArg.getText()));
        break;
      case SyntaxKind.TrueKeyword:
        res.push(true);
      case SyntaxKind.FalseKeyword:
        res.push(false);
      case SyntaxKind.NumericLiteral:
        res.push(JSON.parse(arg.getText()));
    }
  }
  return res;
}

export function getPropTypes(
  prop: PropertyDeclaration,
): { res: ExtPropType; isNullable: boolean; isList: boolean } {
  const types = prop.getChildren();
  const res = new ExtPropType();
  let isNullable = false;
  let isList = false;
  for (const type of types) {
    if (type.getKind() === SyntaxKind.QuestionToken) {
      isNullable = true;
    }
    if (type.getKind() === SyntaxKind.ArrayType) {
      const arr = type as ArrayTypeNode;
      isList = true;
      const arrRes = getPropType(arr.getFirstChild()!);
      if (arrRes !== undefined) {
        res.type = arrRes.type;
        res.refType = arrRes.refType;
      }
    } else if (type.getKind() === SyntaxKind.UnionType) {
      const y = type as UnionTypeNode;
      for (const ts of y.getTypeNodes()) {
        const union = new ExtPropType();
        const uniRes = getPropType(ts);
        if (uniRes !== undefined) {
          union.type = uniRes.type;
          union.refType = uniRes.refType;
        }
        res.union.push(union);
        res.type = "Union";
      }
    } else {
      const wu = getPropType(type);
      if (wu !== undefined) {
        res.type = wu.type;
        res.refType = wu.refType;
      }
    }
  }
  return { res, isNullable, isList };
}

export function getPropType(
  prop: Node,
): { type: TsTypes; refType?: string } | undefined {
  let res: TsTypes | undefined;
  let refType: string | undefined;
  switch (prop.getKind()) {
    case SyntaxKind.TypeReference:
      const text = prop.getText();
      if (text === "Date") {
        res = "Date";
      } else if (text === "JsonValue") {
        res = "JsonValue";
      } else {
        refType = text;
        res = "TypeReference";
      }
      break;
    case SyntaxKind.StringKeyword:
      res = "string";
      break;
    case SyntaxKind.LiteralType:
      if (prop.getFirstChildByKind(SyntaxKind.NullKeyword) !== undefined) {
        res = "null";
      }
      break;
    case SyntaxKind.NumberKeyword:
      res = "number";
      break;
    case SyntaxKind.UndefinedKeyword:
      res = "undefined";
      break;
    case SyntaxKind.BooleanKeyword:
      res = "boolean";
      break;
  }
  return res !== undefined ? { type: res, refType } : undefined;
}

export function getName(input: Node): string {
  return input.getFirstChildByKind(SyntaxKind.Identifier)?.getText() || "";
}

export function getSimpleProperties(
  input: ObjectLiteralExpression,
): { [k: string]: any } {
  const res: Map<string, any> = new Map();
  const props = input.getProperties();
  for (const prop of props) {
    switch (prop.getKind()) {
      case SyntaxKind.PropertyAssignment:
        const nProp = prop as PropertyAssignment;
        res.set(getName(nProp), handlePropValue(nProp));
        break;
    }
  }
  return Object.fromEntries(res);
}

export function handlePropValue(input: PropertyAssignment): any {
  const value = input.getLastChild();
  switch (value?.getKind()) {
    case SyntaxKind.Identifier:
      const res = getName(value);
      return res === "undifined" ? undefined : res;
    case SyntaxKind.TrueKeyword:
      return true;
    case SyntaxKind.FalseKeyword:
      return false;
    case SyntaxKind.NumericLiteral:
      return JSON.parse(value.getText());
    case SyntaxKind.ArrowFunction:
      const val = value as ArrowFunction;
      return handleFunctions(val);
    case SyntaxKind.ArrayLiteralExpression:
      const arrayArg = value as ArrayLiteralExpression;
      const jsonStr = arrayArg
        .getText()
        .replace(/(\w+:)|(\w+ :)/g, s => {
          return '"' + s.substring(0, s.length - 1) + '":';
        })
        .replace(/[`][\W]*[^`]*[`]/g, str => {
          return str.replace(/["]/g, `'`).replace(/[`]/g, `"`);
        })
        .replace(/(,)([\W])*(})/g, "}")
        .replace(/(})(,)([\W])*(])/g, "}]");
      try {
        return JSON.parse(jsonStr);
      } catch (err) {
        console.log(jsonStr)
      }
    case SyntaxKind.FunctionExpression:
      const funcArg = value as FunctionExpression;
      return handleFunctions(funcArg);
    case SyntaxKind.StringLiteral:
      const strArg = value as StringLiteral;
      return JSON.parse(strArg.getText());
    case SyntaxKind.ObjectLiteralExpression:
      const objArg = value as ObjectLiteralExpression;
      return getSimpleProperties(objArg);
    default:
      return "";
  }
}

export function handleFunctions(
  input: ArrowFunction | FunctionExpression,
): Function {
  const text = input.getText();
  const func = new Function("return " + text)();
  return func;
}

export function addEnumToProps(
  models: ExtModel[],
  files: SourceFile[],
): { modelsRes: ExtModel[]; enumsRes: ExtEnum[] } {
  const enumsRes: ExtEnum[] = [];
  const modelsRes = models.map<ExtModel>(model => {
    model.properties = model.properties.map<ExtProperty>(property => {
      if (property.type.type === "enum") {
        const enumFields: string[] = [];
        files.forEach(file => {
          file
            .getEnum(property.type.refType!)
            ?.getMembers()
            .forEach(member => enumFields.push(member.getName()));
        });
        property.type.enumFields = enumFields;
        enumFields.length > 0
          ? enumsRes.push({
              name: property.type.refType!,
              members: property.type.enumFields,
            })
          : undefined;
        return property;
      }
      return property;
    });
    return model;
  });
  return { modelsRes, enumsRes };
}
