import "reflect-metadata";
import { Container } from "typedi";
import { createConnection, useContainer as ormUseContainer } from "typeorm";
import { SqliteConnectionOptions } from "typeorm/driver/sqlite/SqliteConnectionOptions";
import { buildSchema, formatArgumentValidationError, useContainer as gqlUseContainer } from "type-graphql";
import { ApolloServer } from "./server";

import { CompanyResolver } from "./resolvers/companyResolver";
import { PhoneResolver } from "./resolvers/phoneResolver";

import baseConfig from '../ormconfig.json';

// register 3rd party IOC container
gqlUseContainer(Container);
ormUseContainer(Container);

void (async function bootstrap() {
  process.env.NODE_ENV = process.env.NODE_ENV || 'production';
  const isProd = process.env.NODE_ENV === 'production';

  const ormConfig: SqliteConnectionOptions = {
    ...baseConfig,
    type: "sqlite",
    logger: "advanced-console",
    logging: "all",
    synchronize: !isProd
  };

  await createConnection(ormConfig);

  // build TypeGraphQL executable schema
  const schema = await buildSchema({
    resolvers: [CompanyResolver, PhoneResolver]
  });

  // Create GraphQL server
  const server = new ApolloServer({
    schema,
    // remember to pass `formatArgumentValidationError`
    // otherwise validation errors won't be returned to a client
    formatError: formatArgumentValidationError,
    introspection: true,
    playground: true,
    uploads: false,
    debug: true,
    tracing: true,

  });

  // Start the server
  const { url } = await server.listen(4000);
  console.log(`Server is running, GraphQL Playground available at ${url}`);
})().catch(console.error);
