import { OrmText } from "../texts/interfaces";
import { pushListUnique } from "./helpers";
import { EmbeddedModel, Field, InputClasses } from "./mapper-types";

export function icuEmbeddedModels(texts: OrmText): EmbeddedModel[] {
  const res: EmbeddedModel[] = [];

  const idField = new Field();
  idField.isId = true;
  idField.tsType = "number";
  idField.graphqlType = "Int";
  idField.name = "id";
  idField.diffOrmDecorator = {
    name: texts.idDecoratorName,
    text: "",
  };
  idField.isOmitted = [InputClasses.create, InputClasses.update];

  const updatedAtField = new Field();
  updatedAtField.tsType = "Date";
  updatedAtField.graphqlType = "Date";
  updatedAtField.name = "updatedAt";
  updatedAtField.default = texts.updatedAtDecoratorDefault;
  updatedAtField.diffOrmDecorator = {
    name: texts.updatedAtDecoratorName,
    text: texts.updatedAtDecoratorText,
  };
  updatedAtField.isOmitted = [InputClasses.create, InputClasses.update];

  const createdAtField = new Field();
  createdAtField.tsType = "Date";
  createdAtField.graphqlType = "Date";
  createdAtField.name = "createdAt";
  createdAtField.default = texts.createdAtDecoratorDefault;
  createdAtField.diffOrmDecorator = {
    name: texts.createdAtDecoratorName,
    text: texts.createdAtDecoratorText,
  };
  createdAtField.isOmitted = [InputClasses.create, InputClasses.update];

  const extend = texts.baseEntityText;
  const togBase = new EmbeddedModel();
  togBase.base = true
  togBase.extends = extend;
  togBase.name = "TogBase";
  
  const togBaseI = new EmbeddedModel();
  togBaseI.extends = extend;
  togBaseI.base = true
  togBaseI.name = "TogBaseI";
  togBaseI.idField = "id";
  togBaseI.fields.push(idField);
  
  const togBaseIC = new EmbeddedModel();
  togBaseIC.extends = extend;
  togBaseIC.base = true
  togBaseIC.name = "TogBaseIC";
  togBaseIC.idField = "id";
  togBaseIC.fields.push(idField, createdAtField);
  
  const togBaseICU = new EmbeddedModel();
  togBaseICU.extends = extend;
  togBaseICU.base = true
  togBaseICU.name = "TogBaseICU";
  togBaseICU.idField = "id";
  togBaseICU.fields.push(idField, createdAtField, updatedAtField);
  
  const togBaseIU = new EmbeddedModel();
  togBaseIU.extends = extend;
  togBaseIU.base = true
  togBaseIU.name = "TogBaseIU";
  togBaseIU.idField = "id";
  togBaseIU.fields.push(idField, updatedAtField);

  const togBaseU = new EmbeddedModel();
  togBaseU.extends = extend;
  togBaseU.base = true
  togBaseU.name = "TogBaseU";
  togBaseU.fields.push(updatedAtField);
  
  const togBaseC = new EmbeddedModel();
  togBaseC.extends = extend;
  togBaseC.base = true
  togBaseC.name = "TogBaseC";
  togBaseC.fields.push(createdAtField);
  
  const togBaseCU = new EmbeddedModel();
  togBaseCU.extends = extend;
  togBaseCU.base = true
  togBaseCU.name = "TogBaseCU";
  togBaseCU.fields.push(createdAtField, updatedAtField);
  
  pushListUnique(res, 
    togBase,
    togBaseI,
    togBaseIC,
    togBaseICU,
    togBaseIU,
    togBaseC,
    togBaseCU,
    togBaseU,
  );
  return res;
}
