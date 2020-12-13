import { SupportedOrms } from "../config";
import { MikroOrmText } from "../texts/mikro-orm";
import { TypeOrmText } from "../texts/typeorm";
import { EmbeddedModel, Field, InputClasses } from "./mapper-types";

export function embeddedModels(type: SupportedOrms): EmbeddedModel[] {
  const res: EmbeddedModel[] = [];

  const idField = new Field();
  idField.isId = true;
  idField.tsType = "number";
  idField.graphqlType = "Int";
  idField.name = "id";
  idField.diffOrmDecorator = {
    name:
      type === "TypeOrm"
        ? TypeOrmText.idDecoratorName
        : MikroOrmText.idDecoratorName,
    text: "",
  };
  idField.isOmitted = [InputClasses.create, InputClasses.update];

  const updatedAtField = new Field();
  updatedAtField.tsType = "Date";
  updatedAtField.graphqlType = "Date";
  updatedAtField.name = "updatedAt";
  updatedAtField.default =
    type === "TypeOrm"
      ? TypeOrmText.updatedAtDecoratorDefault
      : MikroOrmText.updatedAtDecoratorDefault;
  updatedAtField.diffOrmDecorator = {
    name:
      type === "TypeOrm"
        ? TypeOrmText.updatedAtDecoratorName
        : MikroOrmText.updatedAtDecoratorName,
    text:
      type === "TypeOrm"
        ? TypeOrmText.updatedAtDecoratorText
        : MikroOrmText.updatedAtDecoratorText,
  };
  updatedAtField.isOmitted = [InputClasses.create, InputClasses.update];

  const createdAtField = new Field();
  createdAtField.tsType = "Date";
  createdAtField.graphqlType = "Date";
  createdAtField.name = "createdAt";
  createdAtField.default =
    type === "TypeOrm"
      ? TypeOrmText.createdAtDecoratorDefault
      : MikroOrmText.createdAtDecoratorDefault;
  createdAtField.diffOrmDecorator = {
    name: type === "TypeOrm" ? TypeOrmText.createdAtDecoratorName : MikroOrmText.createdAtDecoratorName,
    text: type === "TypeOrm" ? TypeOrmText.createdAtDecoratorText : MikroOrmText.createdAtDecoratorText,
  };
  createdAtField.isOmitted = [InputClasses.create, InputClasses.update];

  const togBase = new EmbeddedModel();
  togBase.extends = "BaseEntity";
  togBase.name = "TogBase";

  const togBaseI = new EmbeddedModel();
  togBaseI.extends = "BaseEntity";
  togBaseI.name = "TogBaseI";
  togBaseI.idField = "id";
  togBaseI.fields.push(idField);

  const togBaseIC = new EmbeddedModel();
  togBaseIC.extends = "BaseEntity";
  togBaseIC.name = "TogBaseIC";
  togBaseIC.idField = "id";
  togBaseIC.fields.push(idField, createdAtField);

  const togBaseICU = new EmbeddedModel();
  togBaseICU.extends = "BaseEntity";
  togBaseICU.name = "TogBaseICU";
  togBaseICU.idField = "id";
  togBaseICU.fields.push(idField, createdAtField, updatedAtField);

  const togBaseIU = new EmbeddedModel();
  togBaseIU.extends = "BaseEntity";
  togBaseIU.name = "TogBaseIU";
  togBaseIU.idField = "id";
  togBaseIU.fields.push(idField, updatedAtField);

  const togBaseU = new EmbeddedModel();
  togBaseU.extends = "BaseEntity";
  togBaseU.name = "TogBaseU";
  togBaseU.fields.push(updatedAtField);

  const togBaseC = new EmbeddedModel();
  togBaseC.extends = "BaseEntity";
  togBaseC.name = "TogBaseC";
  togBaseC.fields.push(createdAtField);

  const togBaseCU = new EmbeddedModel();
  togBaseCU.extends = "BaseEntity";
  togBaseCU.name = "TogBaseC";
  togBaseCU.fields.push(createdAtField, updatedAtField);

  res.push(
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
