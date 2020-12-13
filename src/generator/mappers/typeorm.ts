import { TogRelationOptions } from '../decorators';
import { DecoratorData } from './mapper-types';

export function typeOrmRelation(opts: TogRelationOptions): DecoratorData[] {
  const res: DecoratorData[] = [];
  const optsText: string[] = []
  if (opts.cascade || opts.lazy || opts.nullable) {
    optsText.push(", {")
    opts.cascade ? optsText.push(`cascade: ${opts.cascade},`) : undefined
    opts.cascade ? optsText.push(`nullable: ${opts.nullable},`) : undefined
    opts.cascade ? optsText.push(`lazy: ${opts.lazy}`) : undefined
    optsText.push("}")
  }
  if (opts.type === "m2o") {
    res.push({
      name: "ManyToOne",
      text: `_type => ${opts.model}, rel => rel.${opts.modelField} ${optsText.join(" ")}`,
    });
  } else if (opts.type === "o2m") {
    res.push({
      name: "OneToMany",
      text: `_type => ${opts.model}, rel => rel.${opts.modelField} ${optsText.join(" ")}`,
    });
  } else if (opts.type === "o2o") {
    res.push({
      name: "OneToOne",
      text: `_type => ${opts.model}, rel => rel.${opts.modelField} ${optsText.join(" ")}`,
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
  res.push(...(opts.decorators || []))
  return res;
}
