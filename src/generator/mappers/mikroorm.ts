import { TogRelationOptions } from "../decorators";
import { GenDecorator } from "../generators/gen-types";
import { OrmText } from "../texts/interfaces";
import { MikroOrmText } from "../texts/mikro-orm";
import { OrmMapper } from "./interfaces";
import { DecoratorData, ExcludeFieldFrom, Field, Model } from "./mapper-types";

export class MikroOrmMapper extends OrmMapper {
  texts: OrmText = new MikroOrmText();

  genRelation(opts: TogRelationOptions): DecoratorData[] {
    const res: DecoratorData[] = [];
    const optsText: string[] = [];
    if (opts.cascade || opts.lazy || opts.nullable) {
      optsText.push(", {");
      opts.cascade ? optsText.push(`cascade: ${opts.cascade},`) : undefined;
      opts.cascade ? optsText.push(`nullable: ${opts.nullable},`) : undefined;
      opts.cascade ? optsText.push(`lazy: ${opts.lazy},`) : undefined;
      optsText.push("}");
    }
    if (opts.type === "m2o") {
      res.push({
        name: "ManyToOne",
        text: `_type => ${opts.model}, rel => rel.${
          opts.modelField
        } ${optsText.join(" ")}`,
      });
    } else if (opts.type === "o2m") {
      res.push({
        name: "OneToMany",
        text: `_type => ${opts.model}, rel => rel.${
          opts.modelField
        } ${optsText.join(" ")}`,
      });
    } else if (opts.type === "o2o") {
      res.push({
        name: "OneToOne",
        text: `_type => ${opts.model}, rel => rel.${
          opts.modelField
        } ${optsText.join(" ")}`,
      });
    } else {
      res.push({
        name: "ManyToMany",
        text: `() => ${opts.model}, ${optsText.join(" ")}`,
      });
    }
    res.push(...(opts.decorators || []));
    return res;
  }

  genModelFieldDecorator(field: Field): GenDecorator[] {
    const res: GenDecorator[] = [];
    const include =
      field.excludeFrom !== ExcludeFieldFrom.orm &&
      field.excludeFrom !== ExcludeFieldFrom.both;
    field.isIndex && include
      ? res.push({
          name: "Index",
          arguments: [""],
        })
      : undefined;
    if ((field.isEnum || field.isEmbedded) && include) {
      const name = field.isEnum
        ? "Enum"
        : field.isList
        ? this.texts.normalDecoratorName
        : "Embedded";
      const argEnum = field.isEnum
        ? `{ items: () => ${field.tsType.replace("[]", "")}, ${
            field.isList ? "array: true" : ""
          }, default: ${field.default} }`
        : ``;
      const argEmbedded = field.isEmbedded
        ? `${field.isList ? `{ type: ArrayType }` : ""}`
        : ``;
      res.push({
        name,
        arguments: [[argEnum, argEmbedded].join("")],
      });
    } else {
      let fieldName = this.texts.normalDecoratorName;
      const args: string[] = [];
      args.push("");
      if (field.diffOrmDecorator) {
        fieldName = field.diffOrmDecorator.name;
        args.push(field.diffOrmDecorator.text || "");
      } else if (field.isId) {
        fieldName = this.texts.idDecoratorName;
        // type - array - default
      } else if (
        field.defaultRaw ||
        field.isNullable ||
        field.isList ||
        field.tsType === "JsonValue"
      ) {
        args.push("{ ");
        field.default ? args.push(`default: ${field.default}, `) : undefined;
        field.defaultRaw
          ? args.push(`defaultRaw: ${field.defaultRaw}, `)
          : undefined;
        field.tsType === "JsonValue" ? args.push(`type: "json", `) : undefined;
        field.isList ? args.push(`type: ArrayType, `) : undefined;
        args.push("}");
      }
      include
        ? res.push({
            name: fieldName,
            arguments: [args.join(" ")],
          })
        : undefined;
    }
    return res;
  }

  genInputFieldDecorator(opts: TogRelationOptions): GenDecorator[] {
    throw new Error("Method not implemented.");
  }

  genModelDecorator(
    modelName: string,
    uniqueFields: string[],
    isEmbedded: boolean = false,
  ): GenDecorator[] {
    return [
      {
        name: isEmbedded ? "Embeddable" : "Entity",
        arguments: [""],
      },
      ...uniqueFields.map<GenDecorator>(v => ({
        name: "Unique",
        arguments: [`{properties: [${v}]}`],
      })),
    ];
  }
}
