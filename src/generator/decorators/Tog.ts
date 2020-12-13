import { TogRelationOptions } from './options/RelationOptions';
import { TogCruds } from "./options/TogCruds";
import { TogFieldOptions } from './options/TogFieldOptions';
import { TogOptions } from "./options/TogOptions";

/**
 * Tog is used to mark classes to add more or change some functionalities of the generator
 * this is required for generator.
 */
export function Tog(options?: TogOptions): ClassDecorator {
  return target => {
    console.log("Hello");
  };
}

/**
 * you should provide this option when you choose Custom for orm or graphql library.
 */
export function TogCrud(options: TogCruds): ClassDecorator {
  return target => {
    console.log("Hello");
  };
}

/**
 * options to change normal generater behavior.
 */
export function TogField(options?: TogFieldOptions): PropertyDecorator {
  return (target, key) => {
    console.log("Hello");
  };
}

/**
 * use this decorator for your relation fields.
 */
export function TogRelationField(options: TogRelationOptions): PropertyDecorator {
  return (target, key) => {
    console.log("Hello");
  };
}

/**
 * use this decorator for your relation fields.
 */
export function TogEmbedded(): ClassDecorator {
  return (target) => {
    console.log("Hello");
  };
}
