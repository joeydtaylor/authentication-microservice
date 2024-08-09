import dotenv from "dotenv";
import path from "path";
import Joi from "joi";

// Load and validate environment variables
const envPath = path.resolve(__dirname, `../../.env.${process.env.NODE_ENV}`);
dotenv.config({ path: envPath });

const envVarsSchema = Joi.object({
  PORT: Joi.number().default(3000),
  APP_NAME: Joi.string().required(),
  REDIS_CONNECTION_STRING: Joi.string().required(),
  SESSION_COOKIE_SECRET: Joi.string().required(),
  BASE_URL: Joi.string().required(),
  FRONT_END_BASE_URL: Joi.string().required(),
  SERVER_SSL_CERTIFICATE: Joi.string().required(),
  SERVER_SSL_PRIVATE_KEY: Joi.string().required(),
  SAML_SP_ENTITY_ID: Joi.string(),
  SAML_IDP_BASE_URL: Joi.string(),
  SAML_METADATA_PATH: Joi.string(),
  OIDC_ISSUER: Joi.string(),
  OIDC_CLIENT_ID: Joi.string(),
  OIDC_CLIENT_SECRET: Joi.string(),
  LOCAL_ADMIN_USERNAME: Joi.string().required(),
  LOCAL_ADMIN_PASSWORD: Joi.string().required(),
  APPLICATION_COOKIE_SECRET: Joi.string(),
  APPLICATION_COOKIE_SAME_SITE: Joi.string(),
  SESSION_COOKIE_NAME: Joi.string().required(),
  SESSION_COOKIE_SAME_SITE: Joi.string().required(),
  ADMIN_ROLE_NAME: Joi.string().required(),
  DEVELOPER_ROLE_NAME: Joi.string().required(),
  CONTRIBUTOR_ROLE_NAME: Joi.string().required(),
  READER_ROLE_NAME: Joi.string().required(),
  LOG_DIRECTORY: Joi.string().required(),
  LOG_MAX_SIZE_IN_NUMBER_MB: Joi.number().required(),
  SPLUNK_LOGGING_TOKEN: Joi.string().allow(''),
  SPLUNK_LOGGING_URL: Joi.string().allow(''),
}).unknown().required();

const { error, value: envVars } = envVarsSchema.validate(process.env);
if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

// Cache frequently used environment variables
const {
  PORT,
  APP_NAME,
  REDIS_CONNECTION_STRING,
  SESSION_COOKIE_SECRET,
  BASE_URL,
  FRONT_END_BASE_URL,
  SERVER_SSL_CERTIFICATE,
  SERVER_SSL_PRIVATE_KEY,
  SAML_SP_ENTITY_ID,
  SAML_IDP_BASE_URL,
  SAML_METADATA_PATH,
  OIDC_ISSUER,
  OIDC_CLIENT_ID,
  OIDC_CLIENT_SECRET,
  LOCAL_ADMIN_USERNAME,
  LOCAL_ADMIN_PASSWORD,
  APPLICATION_COOKIE_SECRET,
  APPLICATION_COOKIE_SAME_SITE,
  SESSION_COOKIE_NAME,
  SESSION_COOKIE_SAME_SITE,
  ADMIN_ROLE_NAME,
  DEVELOPER_ROLE_NAME,
  CONTRIBUTOR_ROLE_NAME,
  READER_ROLE_NAME,
  LOG_DIRECTORY,
  LOG_MAX_SIZE_IN_NUMBER_MB,
  SPLUNK_LOGGING_TOKEN,
  SPLUNK_LOGGING_URL,
} = envVars;

export const config: Configuration.ISchema = {
  app: {
    name: APP_NAME,
    port: PORT,
    logging: {
      logDir: LOG_DIRECTORY,
      logRetentionInDays: 1,
      logMaxSizeInNumberMB: LOG_MAX_SIZE_IN_NUMBER_MB,
      logMaxFilecount: 4,
      splunkLogging: {
        enabled: Boolean(SPLUNK_LOGGING_TOKEN && SPLUNK_LOGGING_URL),
        token: SPLUNK_LOGGING_TOKEN,
        url: SPLUNK_LOGGING_URL,
      },
    },
    baseUrl: BASE_URL,
    frontEndBaseUrl: FRONT_END_BASE_URL,
  },
  security: {
    corsOrigin: [],
    serverSslCertificate: SERVER_SSL_CERTIFICATE,
    serverSslPrivateKey: SERVER_SSL_PRIVATE_KEY,
    authentication: {
      defaultAuthenticationMethod: "oidc",
      samlConfiguration: {
        enabled: Boolean(SAML_SP_ENTITY_ID && SAML_IDP_BASE_URL && SAML_METADATA_PATH),
        strategy: "saml",
        spPrivateKey: "",
        spPublicCertificate: "",
        path: "/api/auth/saml/consume",
        issuer: SAML_SP_ENTITY_ID,
        idpBaseUrl: SAML_IDP_BASE_URL,
        samlMetadataPath: SAML_METADATA_PATH,
      },
      oidcConfiguration: {
        enabled: Boolean(OIDC_ISSUER && OIDC_CLIENT_ID && OIDC_CLIENT_SECRET),
        issuer: OIDC_ISSUER,
        client_id: OIDC_CLIENT_ID,
        client_secret: OIDC_CLIENT_SECRET,
      },
      localConfiguration: {
        enabled: true,
        adminUsername: LOCAL_ADMIN_USERNAME,
        adminPassword: LOCAL_ADMIN_PASSWORD,
      },
      sessionStoreConfiguration: {
        redisConnectionString: REDIS_CONNECTION_STRING,
        cookie: {
          secret: SESSION_COOKIE_SECRET,
          sameSite: process.env.NODE_ENV !== "production" ? "none" : SESSION_COOKIE_SAME_SITE,
          secure: true,
          httpOnly: true,
          name: SESSION_COOKIE_NAME,
          signed: true,
          rememberMeLoginDurationInDays: 30,
          maxAgeInHours: 24,
        },
        resave: false,
        saveUninitialized: false,
      },
      applicationCookieConfiguration: {
        secret: APPLICATION_COOKIE_SECRET,
        signed: Boolean(APPLICATION_COOKIE_SECRET),
        secure: true,
        httpOnly: false,
        sameSite: APPLICATION_COOKIE_SAME_SITE,
      },
    },
    authorization: {
      roles: {
        admin: {
          name: ADMIN_ROLE_NAME,
        },
        developer: {
          name: DEVELOPER_ROLE_NAME,
        },
        contributor: {
          name: CONTRIBUTOR_ROLE_NAME,
        },
        reader: {
          name: READER_ROLE_NAME,
        },
      },
    },
  },
};

export default config;
