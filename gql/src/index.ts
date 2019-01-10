import "reflect-metadata";
import { Container } from "typedi";
import { createConnection, useContainer as ormUseContainer } from "typeorm";
import { SqliteConnectionOptions } from "typeorm/driver/sqlite/SqliteConnectionOptions";
import { buildSchema, formatArgumentValidationError, useContainer as gqlUseContainer } from "type-graphql";
import express from 'express';

import { ApolloServer } from "./server";

import { CompanyResolver } from "./resolvers/companyResolver";
import { PhoneResolver } from "./resolvers/phoneResolver";

import baseConfig from '../ormconfig.json';
import net from "net";

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
    resolvers: [CompanyResolver, PhoneResolver],
    emitSchemaFile: "../schema.graphql"
  });

  const app = express();

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

  const http = app.listen(4000, () => {
    server.installSubscriptionHandlers(http);

    const serverInfo: any = {
      ...(http.address() as net.AddressInfo),
      server: http,
      subscriptionsPath: server.subscriptionsPath,
    };

    // Convert IPs which mean "any address" (IPv4 or IPv6) into localhost
    // corresponding loopback ip. Note that the url field we're setting is
    // primarily for consumption by our test suite. If this heuristic is
    // wrong for your use case, explicitly specify a frontend host (in the
    // `frontends.host` field in your engine config, or in the `host`
    // option to ApolloServer.listen).
    let hostForUrl = serverInfo.address;
    if (serverInfo.address === '' || serverInfo.address === '::')
      hostForUrl = 'localhost';

    serverInfo.url = require('url').format({
      protocol: 'http',
      hostname: hostForUrl,
      port: serverInfo.port,
      pathname: server.graphqlPath,
    });

    serverInfo.subscriptionsUrl = require('url').format({
      protocol: 'ws',
      hostname: hostForUrl,
      port: serverInfo.port,
      slashes: true,
      pathname: server.subscriptionsPath,
    });

    console.log(`Server is running, GraphQL Playground available at ${serverInfo.url}`);
  });
})().catch(console.error);
