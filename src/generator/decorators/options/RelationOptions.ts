import { DecoratorData } from '../../mappers/mapper-types';

/**
 * Tog Generator Options for Generator Resolvers.
 */
export interface TogRelationOptions {
  /**
   * the field that points to this model at the other model
   */
  modelField: string;
  /**
   * name of the other model
   */
  model: string;
  /**
   * the field that points to this model at the other model
   */
  type: TogRelationType
  /**
   * the field name you wanna generate for relation id
   */
  relationField?: string;
  /**
   * is model is the owning side or not
   */
  owningSide?: boolean;
  /**
   * if the relation should load lazily
   */
  lazy?: boolean;
  /**
   * if the relation should load lazily
   */
  cascade?: boolean;
  /**
   * if the relation is ManytoMany do you wanna generate joinTable decorator default true
   */
  m2mJoin?: boolean;
  /**
   * if the relation is ManytoMany do you wanna generate joinTable decorator default true
   */
  m2mJoinText?: string;
  /**
   * if the relation should load lazily
   */
  nullable?: boolean;
  /**
   * additional decorators for the field
   */
  decorators?: DecoratorData[];
}

export declare type TogRelationType = "m2o" | "m2m" | "o2o" | "o2m";