import "reflect-metadata";
import { promises as fs } from "fs";
// import { buildSchema } from "type-graphql";
// import { graphql } from "graphql";

import generateArtifactsDirPath from "../helpers/artifacts-dir";
import generateCode from "../../src/generator/generators/generator";
import path from "path";
import { testProject } from "../helpers/project";

describe("test generation", () => {
  let outputDirPath: string;

  beforeEach(async () => {
    outputDirPath = generateArtifactsDirPath("generating-data");
    await fs.mkdir(outputDirPath, { recursive: true });
  });

  it("should properly create models, args, inputs, resolvers and ... from tog files", async () => {
    const dir = path.resolve(__dirname, "..", "files");
    await generateCode(outputDirPath, dir, "tog", undefined, true, true, "TypeGraphql", "MikroOrm", false, true, true, true, true, testProject);
    // const { UserCrudResolver } = require(outputDirPath +
    //   "/resolvers/User/UserCrudResolver.ts");
    // const graphQLSchema = await buildSchema({
    //   resolvers: [UserCrudResolver],
    //   validate: false,
    // });
    // const document = /* graphql */ `
    //   query {
    //     user(where: { id: 1 }) {
    //       id
    //       dateOfBirth
    //       firstName
    //     }
    //   }
    // `;
    // const prismaMock = {
    //   user: {
    //     findOne: jest.fn().mockResolvedValue({
    //       id: 1,
    //       dateOfBirth: new Date("2019-12-31T14:16:02.572Z"),
    //       name: "John",
    //     }),
    //   },
    // };

    // const { data, errors } = await graphql(graphQLSchema, document, null, {
    //   prisma: prismaMock,
    // });

    // expect(errors).toBeUndefined();
    // expect(data).toMatchSnapshot("user mocked response");
  });

  
});
