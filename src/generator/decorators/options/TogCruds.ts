import { TogCrudOptions } from "./CrudOptions";

/**
 * every crudResolver that tog-cli creates for your models
 */
export interface TogCruds {
  create: TogCrudOptions;
  // createMany: TogCrudOptions;
  get: TogCrudOptions;
  getMany: TogCrudOptions;
  delete: TogCrudOptions;
  deleteMany: TogCrudOptions;
  update: TogCrudOptions;
  updateMany: TogCrudOptions;
  all: TogCrudOptions;
}
