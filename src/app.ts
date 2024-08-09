import express from "express"; // Removed unused Request import
import passport from "passport";
import cookieParser from "cookie-parser";
import session from "express-session";
import cors from "cors";
import helmet from "helmet";
import https from "https";
import fs from "fs";
import Redis from 'ioredis';
import RedisStore from "connect-redis";
import { ApolloServer } from "apollo-server-express";
import { ApolloServerPluginLandingPageDisabled } from "apollo-server-core";
import compression from "compression";
import "reflect-metadata";
import depthLimit from "graphql-depth-limit";
import { buildSchema } from "type-graphql";
import userContextResolver from "./api/graphql/userContext/userContext.resolver";
import configurationResolver from "./api/graphql/configuration/configuration.resolver";
import { InMemoryLRUCache } from '@apollo/utils.keyvaluecache';
import { globalConfiguration } from "./helpers/configuration";

// Define Req type properly
type Req = {
  req: express.Request;
};

// Helper to conditionally load modules only in production
const conditionalUse = (middleware: any, app: express.Express, condition: boolean) => {
  if (condition) {
    app.use(middleware);
  }
};

const main = async () => {
  const app = express();

  // Initialize Passport Authentication
  await require("./middleware/authentication/passport")(passport, globalConfiguration);
  app.use(passport.initialize());

  // Logging and Monitoring Middleware
  await require("./middleware/logging/logger")(app, globalConfiguration);
  await require("./middleware/logging/prometheus")(app);

  // Compression and Security Middleware (Only in Production)
  conditionalUse(compression(), app, process.env.NODE_ENV === "production");
  conditionalUse(helmet(), app, process.env.NODE_ENV === "production");

  // CORS and Cookie Parser Middleware
  app.use(cors({
    origin: globalConfiguration.security.corsOrigin,
    allowedHeaders: ["Content-Type", "Authorization", "Access-Control-Allow-Headers"],
    methods: ["GET", "PUT", "POST", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  }));
  app.use(cookieParser(globalConfiguration.security.authentication.sessionStoreConfiguration.cookie.secret));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Redis Store for Sessions
  const redisClient = new Redis(globalConfiguration.security.authentication.sessionStoreConfiguration.redisConnectionString);
  const redisStore = new RedisStore({
    client: redisClient,
    prefix: globalConfiguration.app.name,
  });

  // Session Configuration
  app.use(session({
    store: redisStore,
    name: globalConfiguration.security.authentication.sessionStoreConfiguration.cookie.name,
    resave: false, // Avoid unnecessary session save if unmodified
    saveUninitialized: false, // Avoid creating sessions for unauthenticated users
    secret: globalConfiguration.security.authentication.sessionStoreConfiguration.cookie.secret,
    cookie: {
      signed: true,
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax", // Helps prevent CSRF
      maxAge: globalConfiguration.security.authentication.sessionStoreConfiguration.cookie.maxAgeInHours * 60 * 60 * 1000,
    },
  }));

  app.use(passport.session());

  // Conditionally Load Routes Based on Enabled Authentication
  if (globalConfiguration.security.authentication.oidcConfiguration.enabled) {
    await require("./middleware/authentication/openIdConnect")(app, globalConfiguration);
    await require("./api/routes/auth/oidc")(app);
  }

  if (globalConfiguration.security.authentication.samlConfiguration.enabled) {
    await require("./api/routes/auth/saml")(app, globalConfiguration, passport);
  }

  if (globalConfiguration.security.authentication.localConfiguration.enabled) {
    await require("./api/routes/auth/local")(app, passport);
  }
  await require("./api/routes/auth/logout")(app, globalConfiguration);
  await require("./api/routes/auth/session")(app);
  await require("./api/routes/index")(app);

  // GraphQL Schema and Server
  const schema = await buildSchema({
    resolvers: [userContextResolver, configurationResolver],
    authChecker: async ({ context }, props) => {
      const allowList = props.find(acl => acl.allow === "allAuthenticated" || acl.allow.includes(context.currentRole.name || context.user.username)) || [];
      return (context.user && (allowList === "allAuthenticated" || allowList.includes(context.currentRole.name))) || context.currentRole.name === globalConfiguration.security.authorization.roles.admin.name;
    },
  });

  const graphQlServer = new ApolloServer({
    schema,
    validationRules: [depthLimit(7)],
    debug: process.env.NODE_ENV !== "production",
    introspection: process.env.NODE_ENV !== "production",
    persistedQueries: { cache: new InMemoryLRUCache({ maxSize: 1000 }) },
    context: async ({ req }: Req) => ({
      ...req.user && {
        user: { username: req.user.username, roles: req.user.roles },
        currentRole: { name: req.user.role },
        authenticationSource: { provider: req.user.authenticationSource },
      }
    }),
    plugins: process.env.NODE_ENV === "production" ? [ApolloServerPluginLandingPageDisabled()] : [],
  });

  await graphQlServer.start();
  graphQlServer.applyMiddleware({ app });

  // Start HTTPS Server
  if (globalConfiguration.security.authentication.samlConfiguration.enabled || globalConfiguration.security.authentication.oidcConfiguration.enabled || globalConfiguration.security.authentication.localConfiguration.enabled) {
    https.createServer({
      key: fs.readFileSync(globalConfiguration.security.serverSslPrivateKey),
      cert: fs.readFileSync(globalConfiguration.security.serverSslCertificate),
    }, app).listen(globalConfiguration.app.port, () => {
      console.log(`Server listening on port ${globalConfiguration.app.port} and GraphQL at ${graphQlServer.graphqlPath}`);
    });
  } else {
    console.error("Startup failed because there is not at least one authentication method enabled");
  }
};

main();
