import { DecoratorData } from '../../mappers/mapper-types';

/**
 * TogCrudOptions is used to add or change the behavior of  
 */
export class TogCrudOptions {
  /**
   * decide how to write resolvers based on the graphqlType.
   */
  middlewaresText: string[] = [];
  /**
   * used in testing at the end of generation if not same as it is in graphqlText it will throw error.
   */
  functionName?: string;
  /**
   * description for your graphql resolver.
   */
  description?: string;
  /**
   * this text will be generated in the resolver you can access type with `$type`, `$catchErrFunc`
   * example:
   * ```typescript
   * try {
   *   const res = await $type.update(args.where, args.data as $type)
   *   return {
   *     succesful: res.affected === 1 ? true : false,
   *     error: res.affected! > 1 ? "Unique Error"
   *   };
   * } catch (err) {
   *   $catchErrFunc(err)
   * }
   * ```
   */
  ormText?: string;
  /**
   * this text will be generated resolver class for this types you can access type with `$type`, `$ormText`, `$description`, `$middlewareText`
   * example:
   * ```typescript
   * \@Mutation(_returns => IndivitualResponse, {
   *   nullable: true,
   *   description: $description
   * })
   * \@UseMiddleware($middlewareText)
   *  async $type("camlecase": true)(@Args() args: Update$typeArgs): Promise<IndivitualResponse | void> {
   *    $ormText
   * }
   * ```
   */
  graphqlText?: string;
  /**
   * additional decorators for the resolver
   */
  decorators?: DecoratorData[];
}
