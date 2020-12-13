export class TypeGraphQLText {
  static createRes: string = `@Mutation(_returns => $type, {
    nullable: false,
    description: $description
  })
  @UseMiddleware($middlewareText)
  async create$type(@Ctx() ctx: Context, @Arg("data") args: $typeCreateInput): Promise<$type | void> {
    $ormText
  }`;

  static findOneRes: string = `@Query(_returns => $type, {
    nullable: true,
    description: $description
  })
  @UseMiddleware($middlewareText)
  async $type("camlecase": true)(@Arg("where") args: $typeWhereUniqueInput): Promise<$type | void> {
    $ormText
  }`;

  static findManyRes: string = `@Query(_returns => $type, {
    nullable: true,
    description: $description
  })
  @UseMiddleware($middlewareText)
  async $type("pluralize": true, "camlecase": true)(@Args() args: Find$typeArgs): Promise<$type[] | void> {
    $ormText
  }`;

  static deleteRes: string = `@Mutation(_returns => IndivitualResponse, {
    nullable: true,
    description: $description
  })
  @UseMiddleware($middlewareText)
  async delete$type(@Arg("data") args: $typeWhereUniqueInput): Promise<IndivitualResponse | void> {
    $ormText
  }`;

  static updateRes: string = `@Mutation(_returns => IndivitualResponse, {
    nullable: true,
    description: $description
  })
  @UseMiddleware($middlewareText)
  async update$type(@Args() args: Update$typeArgs): Promise<IndivitualResponse | void> {
    $ormText
  }`;

  static deleteManyRes: string = `@Mutation(_returns => BatchPayload, {
    nullable: false,
    description: $description
  })
  @UseMiddleware($middlewareText)
  async deleteMany$type(@Arg("where") args: $typeWhereInput): Promise<BatchPayload | void> {
    $ormText
  }`;

  static updateManyRes: string = `@Mutation(_returns => BatchPayload, {
    nullable: false,
    description: $description
  })
  @UseMiddleware($middlewareText)
  async updateMany$type(@Args() args: Update$typeArgs): Promise<BatchPayload | void> {
    $ormText
  }`;
}
