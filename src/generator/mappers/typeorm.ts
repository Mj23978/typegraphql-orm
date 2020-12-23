import { TogRelationOptions } from "../decorators";
import { GenDecorator } from "../generators/gen-types";
import { OrmText } from "../texts/interfaces";
import { TypeOrmText } from "../texts/typeorm";
import { OrmMapper } from "./interfaces";
import { DecoratorData, ExcludeFieldFrom, Field } from "./mapper-types";

export class TypeOrmMapper extends OrmMapper {
  texts: OrmText = new TypeOrmText();

  genRelation(opts: TogRelationOptions): DecoratorData[] {
    const res: DecoratorData[] = [];
    const optsText: string[] = [];
    if (opts.cascade || opts.lazy || opts.nullable) {
      optsText.push(", {");
      opts.cascade ? optsText.push(`cascade: ${opts.cascade},`) : undefined;
      opts.cascade ? optsText.push(`nullable: ${opts.nullable},`) : undefined;
      opts.cascade ? optsText.push(`lazy: ${opts.lazy}`) : undefined;
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
      if (!opts.m2mJoin || opts.m2mJoin === true) {
        res.push({
          name: "JoinTable",
          text: opts.m2mJoinText || "",
        });
      }
    }
    res.push(...(opts.decorators || []));
    return res;
  }

  genModelFieldDecorator(field: Field): GenDecorator[] {
    const res: GenDecorator[] = [];
    const type = field.tsType.replace("[]", "")
    const include =
      field.excludeFrom !== ExcludeFieldFrom.orm &&
      field.excludeFrom !== ExcludeFieldFrom.both;
    field.isIndex && include
      ? res.push({
          name: "Index",
          arguments: [""],
        })
      : undefined;
    let fieldName = this.texts.normalDecoratorName;
    const args: string[] = [];
    args.push("");
    if (field.diffOrmDecorator) {
      fieldName = field.diffOrmDecorator.name;
      args.push(field.diffOrmDecorator.text || "");
    } else if (field.isId) {
      fieldName = this.texts.idDecoratorName;
      // enum - nullable - type - array - default
    } else if (field.isEmbedded) {
      field.isEmbedded ? args.push(`_type => ${type}, `) : undefined;
     } else if (
      (field.default ||
      field.defaultRaw ||
      field.isNullable ||
      field.isList ||
      field.isEnum ||
      type === "JsonValue") && !field.isEmbedded
    ) {
      args.push("{ ");
      field.default ? args.push(`default: ${field.default}, `) : undefined;
      field.isEnum
        ? args.push(`type: "enum", enum: ${type}, `)
        : undefined;
      field.isNullable ? args.push(`nullable: true, `) : undefined;
      type === "JsonValue" ? args.push(`type: "json", `) : undefined;
      field.isList ? args.push(`array: true, `) : undefined;
      args.push("}");
    }
    include
      ? res.push({
          name: fieldName,
          arguments: [args.join(" ")],
        })
      : undefined;
    return res;
  }

  genModelDecorator(modelName: string, uniqueFields: string[]): GenDecorator[] {
    return [
      {
        name: "Entity",
        arguments: [""],
      },
      ...uniqueFields.map<GenDecorator>(v => ({
        name: "Unique",
        arguments: [`["${v}"]`],
      })),
    ];
  }

  genInputFieldDecorator(opts: TogRelationOptions): GenDecorator[] {
    throw new Error("Method not implemented.");
  }
}
