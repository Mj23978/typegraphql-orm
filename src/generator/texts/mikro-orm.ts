import { OrmText } from "./interfaces";

export class MikroOrmText extends OrmText {
  idDecoratorName: string = "PrimaryKey";
  normalDecoratorName: string = "Property";
  m2mDecoratorName: string = "ManyToMany";
  o2mDecoratorName: string = "OneToMany";
  o2oDecoratorName: string = "OneToOne";
  m2oDecoratorName: string = "ManyToOne";
  createdAtDecoratorName: string = "Property";
  updatedAtDecoratorName: string = "Property";
  createdAtDecoratorText: string = "";
  updatedAtDecoratorText: string = "{ onUpdate: () => new Date() }";
  baseEntityText: string = "EntityManager";
  createdAtDecoratorDefault = "new Date()";
  updatedAtDecoratorDefault = "new Date()";

  createRes: string = `const res: $type = args.create as $type;
    ctx.em.getRepository($type).persistAndFlush(res);
    return res;`;

  deleteManyRes: string = `const res = await ctx.em.getRepository($type).nativeDelete({
      ...(args.where || {}),
    });
    return { count: res };`;

  updateManyRes: string = `const res = await ctx.em.getRepository($type).nativeUpdate(
      args.where || {},
      args.update as Post
    );
    return { count: res };`;

  deleteRes: string = `const res = await ctx.em.getRepository($type).nativeDelete(args.where);
    return {
      succesful: res === 1 ? true : false,
      error:
        res > 1
          ? "Unique Error: your Delete Query Removed More Than 1 Row"
          : undefined,
    };`;

  updateRes: string = `const res = await ctx.em.getRepository($type).nativeUpdate(
      args.where || {},
      args.update as Post
    );
    return {
      succesful: res === 1 ? true : false,
      error:
        res > 1
          ? "Unique Error: your Update Query Changed More Than 1 Row"
          : undefined,
    };`;

  findManyRes: string = `const res = await ctx.em.getRepository($type).find(args.where || {},
      { offset: args.skip, limit: args.take }
    );
    return res;`;

  findUniqueRes: string = `const res = await ctx.em.getRepository($type).findOneOrFail({ ...args.where });
    return res;`;
}
