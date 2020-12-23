export abstract class OrmText {
  abstract idDecoratorName: string;
  abstract normalDecoratorName: string;
  abstract m2mDecoratorName: string;
  abstract o2mDecoratorName: string;
  abstract o2oDecoratorName: string;
  abstract m2oDecoratorName: string;
  abstract createdAtDecoratorName: string;
  abstract updatedAtDecoratorName: string;
  abstract createdAtDecoratorText: string;
  abstract updatedAtDecoratorText: string;
  abstract baseEntityText: string;
  abstract createdAtDecoratorDefault: any;
  abstract updatedAtDecoratorDefault: any;
  abstract createRes: string;
  abstract deleteManyRes: string;
  abstract updateManyRes: string;
  abstract deleteRes: string;
  abstract updateRes: string;
  abstract findManyRes: string;
  abstract findUniqueRes: string;
}
