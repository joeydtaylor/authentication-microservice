import dotenv from "dotenv";
import path from "path";

const envPath = path.resolve(__dirname, `../../.env.${process.env.NODE_ENV}`);
dotenv.config({ path: envPath });

export const config: Configuration.ISchema = {
  app: {
    name: process.env.APP_NAME,
    port: Number(process.env.PORT),
    logging: {
      logDir: process.env.LOG_DIRECTORY,
      logRetentionInDays: 1,
      logMaxSizeInNumberMB: process.env.LOG_MAX_SIZE_IN_NUMBER_MB,
      logMaxFilecount: 4,
      splunkLogging: {
        enabled:
          process.env.SPLUNK_LOGGING_TOKEN && process.env.SPLUNK_LOGGING_URL
            ? true
            : false,
        token: process.env.SPLUNK_LOGGING_TOKEN,
        url: process.env.SPLUNK_LOGGING_URL,
      },
    },
    baseUrl: process.env.BASE_URL!,
    frontEndBaseUrl: process.env.FRONT_END_BASE_URL!,
  },
  security: {
    corsOrigin: [],
    serverSslCertificate: process.env.SERVER_SSL_CERTIFICATE,
    serverSslPrivateKey: process.env.SERVER_SSL_PRIVATE_KEY,
    authentication: {
      defaultAuthenticationMethod: "oidc",
      samlConfiguration: {
        enabled:
          process.env.SAML_SP_ENTITY_ID &&
          process.env.SAML_IDP_BASE_URL &&
          process.env.SAML_METADATA_PATH
            ? true
            : false,
        strategy: "saml",
        spPrivateKey: "",
        spPublicCertificate: "",
        path: "/api/auth/saml/consume",
        issuer: process.env.SAML_SP_ENTITY_ID,
        idpBaseUrl: process.env.SAML_IDP_BASE_URL,
        samlMetadataPath: process.env.SAML_METADATA_PATH,
      },
      oidcConfiguration: {
        enabled:
          process.env.OIDC_ISSUER &&
          process.env.OIDC_CLIENT_ID &&
          process.env.OIDC_CLIENT_SECRET
            ? true
            : false,
        issuer: process.env.OIDC_ISSUER,
        client_id: process.env.OIDC_CLIENT_ID,
        client_secret: process.env.OIDC_CLIENT_SECRET,
      },
      localConfiguration: {
        enabled: true,
        adminUsername: process.env.LOCAL_ADMIN_USERNAME,
        adminPassword: process.env.LOCAL_ADMIN_PASSWORD,
      },
      sessionStoreConfiguration: {
        redisConnectionString: process.env.REDIS_CONNECTION_STRING,
        cookie: {
          secret: process.env.SESSION_COOKIE_SECRET,
          sameSite:
            process.env.NODE_ENV !== "production"
              ? "none"
              : process.env.SESSION_COOKIE_SAME_SITE,
          secure: true,
          httpOnly: true,
          name: process.env.SESSION_COOKIE_NAME,
          signed: true,
          rememberMeLoginDurationInDays: 30,
          maxAgeInHours: 24,
        },
        resave: false,
        saveUninitialized: false,
      },
      applicationCookieConfiguration: {
        secret: process.env.APPLICATION_COOKIE_SECRET,
        signed: process.env.APPLICATION_COOKIE_SECRET ? true : false,
        secure: true,
        httpOnly: false,
        sameSite: process.env.APPLICATION_COOKIE_SAME_SITE,
      },
    },
    authorization: {
      roles: {
        admin: {
          name: process.env.ADMIN_ROLE_NAME,
        },
        developer: {
          name: process.env.DEVELOPER_ROLE_NAME,
        },
        contributor: {
          name: process.env.CONTRIBUTOR_ROLE_NAME,
        },
        reader: {
          name: process.env.READER_ROLE_NAME,
        },
      },
    },
  },
};

export default config;
