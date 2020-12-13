import { InputClasses, ExcludeFieldFrom, DecoratorData } from "../../mappers/mapper-types";

/**
 * Tog Field Options for Change Default Behavior.
 */
export interface TogFieldOptions {
  /**
   * hide this field from orm or graphql
   */
  hidden?: ExcludeFieldFrom;
  /**
   * important types for generating diffrent fields
   */
  type?: FieldType;
  /**
   * if the field is unique or not
   */
  unique?: boolean;
  /**
   * alias name for this field
   */
  alias?: string;
  /**
   * if the field should be indexed or not
   */
  index?: boolean;
  /**
   * field default value
   */
  default?: string;
  /**
   * add documentation for this field
   */
  docs?: string;
  /**
   * exclude from this classes
   */
  exclude?: InputClasses[];
  /**
   * additional decorators for the field
   */
  decorators?: DecoratorData[];
}


export declare type FieldType = "enum" | "pk" | "float" | "int" | "embedded";