import { OrmText } from "./interfaces";

export class TypeOrmText extends OrmText {
  idDecoratorName: string = "PrimaryGeneratedColumn";
  normalDecoratorName: string = "Column";
  m2mDecoratorName: string = "ManyToMany";
  o2mDecoratorName: string = "OneToMany";
  o2oDecoratorName: string = "OneToOne";
  m2oDecoratorName: string = "ManyToOne";
  createdAtDecoratorName: string = "CreateDateColumn";
  updatedAtDecoratorName: string = "UpdateDateColumn";
  createdAtDecoratorText: string = "";
  updatedAtDecoratorText: string = "";
  baseEntityText: string = "BaseEntity";
  createdAtDecoratorDefault = undefined;
  updatedAtDecoratorDefault = undefined;

  createRes: string = `const res: $type = args.data as $type;
      await $type.save(res)
      return res`;

  deleteManyRes: string = `const res = await $type.delete({
        ...find$typeMapper(args)
      })
      return { count: res.affected! };`;

  updateManyRes: string = `const res = await $type.update(args.where, args.data as $type)
      return { count: res.affected! };`;

  deleteRes: string = `const res = await $type.delete(args.where)
          return {
            succesful: res.affected === 1 ? true : false,
            error: res.affected! > 1 ? "Unique Error: your Delete Query Removed More Than 1 Row" : undefined
          }`;

  updateRes: string = `const res = await $type.update(args.where, args.data as $type)
      return {
        succesful: res.affected === 1 ? true : false,
        error: res.affected! > 1 ? "Unique Error: your Update Query Changed More Than 1 Row" : undefined
      };`;

  findManyRes: string = `const findMap: FindMap = new FindMap()
      args.orderBy ? findMap.order = args.orderBy : null
      args.take ? findMap.take = args.take : null
      args.skip ? findMap.skip = args.skip : null
      args.where ? findMap.where = find$typeMapper(args.where) : null
      const res = await $type.find({
        ...findMap,
      })
      return res;`;

  findUniqueRes: string = `const res = await $type.findOneOrFail({ ...args })
      return res`;
}