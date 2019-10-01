import "reflect-metadata";
import "sqlite3";
import { Container } from "typedi";
import { createConnection, useContainer as ormUseContainer } from "typeorm";
import { SqliteConnectionOptions } from "typeorm/driver/sqlite/SqliteConnectionOptions";
import { buildSchema } from "type-graphql";
import { ApolloServer } from "apollo-server-express";
import { PubSub } from "graphql-subscriptions";
import express from "express";
import net from "net";
import opn from "open";

import { ArpHelper } from "./api/networking/arp-helpers";
import { Company } from "./entities/company";
import { Phone } from "./entities/phone";
import { Softkey } from "./entities/softkey";
import { TopSoftkey } from "./entities/top-softkey";
import { CompanyResolver } from "./resolvers/companyResolver";
import { PhoneResolver } from "./resolvers/phoneResolver";
import { SoftkeyResolver } from "./resolvers/softkeyResolver";

import { initial1559140753150 } from "./migrations/1559140753150-initial";
import { dndSoftkeys1565015427830 } from "./migrations/1565015427830-dnd-softkeys";
import { phoneType1569939955129 } from "./migrations/1569939955129-phone-type";

// register 3rd party IOC container
ormUseContainer(Container);

void (async function bootstrap() {
  process.env.NODE_ENV = process.env.NODE_ENV || "production";
  const isProd = process.env.NODE_ENV === "production";

  Container.get(ArpHelper).execArp();

  const ormConfig: SqliteConnectionOptions = {
    type: "sqlite",
    database: "database.sqlite",
    logger: "advanced-console",
    logging: ["error", "warn", "migration"],
    synchronize: !isProd,
    entities: [Company, Phone, Softkey, TopSoftkey],
    migrations: [
      initial1559140753150,
      dndSoftkeys1565015427830,
      phoneType1569939955129
    ],
    migrationsRun: isProd
    // dropSchema: true,
  };

  await createConnection(ormConfig);

  const pubSub = new PubSub();
  Container.set({ id: "PB", value: pubSub });

  // build TypeGraphQL executable schema
  const schema = await buildSchema({
    resolvers: [CompanyResolver, PhoneResolver, SoftkeyResolver],
    emitSchemaFile: !isProd && "../schema.graphql",
    container: Container,
    pubSub
  });

  const app = express();

  const path = require("path");
  app.use("/", express.static(path.join(__dirname, "./public")));

  // Create GraphQL server
  const server = new ApolloServer({
    schema,
    introspection: true,
    playground: !isProd,
    uploads: false,
    debug: true,
    tracing: true,
    subscriptions: "/api/graphql"
  });

  server.applyMiddleware({ app, path: "/api/graphql" });

  const http = app.listen(4000, () => {
    server.installSubscriptionHandlers(http);

    const serverInfo: any = {
      ...(http.address() as net.AddressInfo),
      server: http,
      subscriptionsPath: server.subscriptionsPath
    };

    // Convert IPs which mean "any address" (IPv4 or IPv6) into localhost
    // corresponding loopback ip. Note that the url field we're setting is
    // primarily for consumption by our test suite. If this heuristic is
    // wrong for your use case, explicitly specify a frontend host (in the
    // `frontends.host` field in your engine config, or in the `host`
    // option to ApolloServer.listen).
    let hostForUrl = serverInfo.address;
    if (serverInfo.address === "" || serverInfo.address === "::")
      hostForUrl = "localhost";

    serverInfo.url = require("url").format({
      protocol: "http",
      hostname: hostForUrl,
      port: serverInfo.port,
      pathname: server.graphqlPath
    });

    serverInfo.subscriptionsUrl = require("url").format({
      protocol: "ws",
      hostname: hostForUrl,
      port: serverInfo.port,
      slashes: true,
      pathname: server.subscriptionsPath
    });

    console.log(
      `Server is running, GraphQL Playground available at ${serverInfo.url}, Subscriptions at ${serverInfo.subscriptionsUrl}`
    );
    isProd && opn("http://localhost:4000");
  });
})().catch(console.error);
