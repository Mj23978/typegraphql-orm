
export class TypeOrmText {
  static idDecoratorName: string = "PrimaryGeneratedColumn";
  static normalDecoratorName: string = "Column";
  static m2mDecoratorName: string = "ManyToMany";
  static o2mDecoratorName: string = "OneToMany";
  static o2oDecoratorName: string = "OneToOne";
  static m2oDecoratorName: string = "ManyToOne";
  static createdAtDecoratorName: string = "CreateDateColumn";
  static updatedAtDecoratorName: string = "UpdateDateColumn";
  static createdAtDecoratorText: string = "";
  static updatedAtDecoratorText: string = "";
  static baseEntityText: string = "BaseEntity";
  static createdAtDecoratorDefault = undefined;
  static updatedAtDecoratorDefault = undefined;

  static createRes: string = `try {
      const res: $type = args.data as $type;
      await $type.save(res)
      return res
    } catch (err) {
      $catchErrFunc(err)
    }`;

  static deleteManyRes: string = `try {
      const res = await $type.delete({
        ...find$typeMapper(args)
      })
      return { count: res.affected! };
    } catch (err) {
      $catchErrFunc(err)
    };`;

  static updateManyRes: string = `try {
      const res = await $type.update(args.where, args.data as $type)
      return { count: res.affected! };
    } catch (err) {
      $catchErrFunc(err)
    }`;

  static deleteRes: string = `try {
          const res = await $type.delete(args.where)
          return {
            succesful: res.affected === 1 ? true : false,
            error: res.affected! > 1 ? "Unique Error: your Delete Query Removed More Than 1 Row" : undefined
          }
        }catch (err) {
          $catchErrFunc(err)
        }`;

  static updateRes: string = `try {
      const res = await $type.update(args.where, args.data as $type)
      return {
        succesful: res.affected === 1 ? true : false,
        error: res.affected! > 1 ? "Unique Error: your Update Query Changed More Than 1 Row" : undefined
      };
    } catch (err) {
      $catchErrFunc(err)
    }`;

  static findManyRes: string = `try {
      const findMap: FindMap = new FindMap()
      args.orderBy ? findMap.order = args.orderBy : null
      args.take ? findMap.take = args.take : null
      args.skip ? findMap.skip = args.skip : null
      args.where ? findMap.where = find$typeMapper(args.where) : null
      const res = await $type.find({
        ...findMap,
      })
      return res;
    } catch (err) {
      $catchErrFunc(err)
    }`;

  static findUniqueRes: string = `try {
      const res = await $type.findOneOrFail({ ...args })
      return res
    } catch (err) {
      $catchErrFunc(err)
    }`;
}