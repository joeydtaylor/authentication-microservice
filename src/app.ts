import express, { Request } from "express";
import passport from "passport";
import cookieParser from "cookie-parser";
import session from "express-session";
import cors from "cors";
import helmet from "helmet";
import https from "https";
import fs from "fs";
import path from "path";
import Redis from 'ioredis';
import RedisStore from "connect-redis"
import { ApolloServer } from "apollo-server-express";
import compression from "compression";
import "reflect-metadata";
import depthLimit from "graphql-depth-limit";
import { buildSchema } from "type-graphql";
import userContextResolver from "./api/graphql/userContext/userContext.resolver";
import configurationResolver from "./api/graphql/configuration/configuration.resolver";
import { globalConfiguration } from "./helpers/configuration";

const main = async () => {
  const corsConfig = {
    origin: globalConfiguration.security.corsOrigin,
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Access-Control-Allow-Headers",
      "Access-Control-Allow-Credentials",
      "Access-Control-Allow-Origin",
    ],
    methods: ["GET", "PUT", "POST", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  };

  const app = express();

  await require("./middleware/authentication/passport")(
    passport,
    globalConfiguration
  );
  await app.use(passport.initialize());

  require("./middleware/logging/logger")(app, globalConfiguration);
  require("./middleware/logging/prometheus")(app);

  app.use(compression());
  app.use(cors(corsConfig));
  if (process.env.NODE_ENV === "production") {
    app.use(helmet());
  }
  app.use(
    cookieParser(
      globalConfiguration.security.authentication.sessionStoreConfiguration
        .cookie.secret
    )
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  const redisClient = new Redis(globalConfiguration.security.authentication.sessionStoreConfiguration.redisConnectionString);

  // Create RedisStore
  const redisStore = new RedisStore({
    client: redisClient,
    prefix: globalConfiguration.app.name,
  });

  app.use(
    session({
      store: redisStore,
      name: globalConfiguration.security.authentication.sessionStoreConfiguration.cookie.name,
      resave: globalConfiguration.security.authentication.sessionStoreConfiguration.resave,
      saveUninitialized: globalConfiguration.security.authentication.sessionStoreConfiguration.saveUninitialized,
      secret: globalConfiguration.security.authentication.sessionStoreConfiguration.cookie.secret,
      cookie: {
        signed: globalConfiguration.security.authentication.sessionStoreConfiguration.cookie.signed,
        secure: globalConfiguration.security.authentication.sessionStoreConfiguration.cookie.secure,
        httpOnly: globalConfiguration.security.authentication.sessionStoreConfiguration.cookie.httpOnly,
        sameSite: globalConfiguration.security.authentication.sessionStoreConfiguration.cookie.sameSite,
        maxAge: globalConfiguration.security.authentication.sessionStoreConfiguration.cookie.maxAgeInHours * 60 * 60 * 1000,
      },
    })
  );

  await app.use(passport.session());

  if (globalConfiguration.security.authentication.oidcConfiguration.enabled) {
    require("./middleware/authentication/openIdConnect")(
      app,
      globalConfiguration
    );
    require("./api/routes/auth/oidc")(app);
  }

  if (
    globalConfiguration.security.authentication.samlConfiguration.enabled &&
    fs.existsSync(
      path.join(
        __dirname,
        `../${globalConfiguration.security.authentication.samlConfiguration.samlMetadataPath}`
      )
    )
  ) {
    require("./api/routes/auth/saml")(app, globalConfiguration, passport);
  }

  if (globalConfiguration.security.authentication.localConfiguration.enabled) {
    require("./api/routes/auth/local")(app, passport);
  }
  require("./api/routes/auth/logout")(app, globalConfiguration);

  require("./api/routes/auth/session")(app);

  require("./api/routes/index")(app);

  const schema = await buildSchema({
    resolvers: [userContextResolver, configurationResolver],
    authChecker: async ({ context }: any, props: any) => {
      let allowList: any = [];
      props.find((acl: any) =>
        acl.allow === "allAuthenticated"
          ? (allowList = "allAuthenticated")
          : acl.allow.map((i: any) => allowList.push(i.name))
      );
      return (context.user &&
        context.currentRole &&
        props &&
        (allowList === "allAuthenticated" ||
          allowList.includes(
            context.currentRole.name || context.user.username
          ))) ||
        (context.user &&
          context.currentRole &&
          context.currentRole.name ===
            globalConfiguration.security.authorization.roles.admin.name)
        ? true
        : false;
    },
  });

  type Req = {
    req: Request;
  };

  const graphQlServer = new ApolloServer({
    schema,
    validationRules: [depthLimit(7)],
    debug: process.env.NODE_ENV === "production" ? false : true,
    introspection: process.env.NODE_ENV === "production" ? false : true,
    context: async ({ req }: Req) => {
      let authenticationContext:
        | Authorization.IAuthenticationContext
        | undefined;

      req.user
        ? (authenticationContext = {
            user: { username: req.user.username, roles: req.user.roles },
            currentRole: { name: req.user.role },
            authenticationSource: {
              provider: req.user.authenticationSource,
            },
          })
        : undefined;

      const globalContext: Service.IGraphQLContext = {
        ...authenticationContext,
      };

      return {
        ...globalContext,
      };
    },
  });

  await graphQlServer.start();
  await graphQlServer.applyMiddleware({
    app,
    cors: corsConfig,
  });

  if (
    globalConfiguration.security.authentication.samlConfiguration.enabled ||
    globalConfiguration.security.authentication.oidcConfiguration.enabled ||
    globalConfiguration.security.authentication.localConfiguration.enabled
  ) {
    https
      .createServer(
        {
          key: fs.readFileSync(
            globalConfiguration.security.serverSslPrivateKey
          ),
          cert: fs.readFileSync(
            globalConfiguration.security.serverSslCertificate
          ),
        },
        app
      )
      .listen(globalConfiguration.app.port, () => {
        console.log(
          "Server listening on port " +
            globalConfiguration.app.port +
            ` and GraphQL at ${graphQlServer.graphqlPath}`
        );
      });
  } else {
    console.error({
      message:
        "Startup failed because there is not at least one authentication method enabled",
      type: "error",
    });
  }
};

main();
