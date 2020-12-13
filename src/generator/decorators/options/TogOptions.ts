import { CrudMiddleware, DecoratorData, ModelDocs } from '../../mappers/mapper-types';

/**
 * Tog Options for Generating Resolvers.
 */
export interface TogOptions {
  /**
   * alias name for this model use for Schema Name.
   */
  alias?: string;
  /**
   * add id Field for this Model based on DB Type.
   */
  id?: boolean;
  /**
   * add CreatedAt Field for this Model.
   */
  createdAt?: boolean;
  /**
   * add UpdatedAt Field for this Model.
   */
  updatedAt?: boolean;
  /**
   * add documentation for this model and it's inputs, args and resolvers
   */
  docs?: ModelDocs;
  /**
   * add documentation for this model
   */
  middlewares?: CrudMiddleware;
  /**
   * additional decorators for the field
   */
  decorators?: DecoratorData[];
}
