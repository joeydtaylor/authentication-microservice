
declare namespace Configuration {
  export interface IApplicationCookieConfiguration {
    signed: boolean;
    secure: boolean;
    httpOnly: boolean;
    sameSite: "lax" | "strict" | "none";
    secret: string;
  }

  export interface ISessionCookieConfiguration {
    secret: string;
    sameSite: "lax" | "strict" | "none";
    secure: boolean;
    httpOnly: boolean;
    name: string;
    signed: boolean;
    rememberMeLoginDurationInDays: number;
    maxAgeInHours: number;
  }

  interface ISplunkLoggingConfiguration {
    enabled: boolean;
    token: string;
    url: string;
  }

  export interface ILoggingConfiguration {
    logDir: string;
    logRetentionInDays: number;
    logMaxSizeInNumberMB: string;
    logMaxFilecount: number;
    splunkLogging: ISplunkLoggingConfiguration;
  }

  export interface ISessionStoreConfiguration {
    redisConnectionString: string;
    cookie: ISessionCookieConfiguration;
    resave: boolean;
    saveUninitialized: boolean;
  }

  interface ISamlAuthenticationConfiguration {
    enabled: boolean;
    strategy: string;
    spPrivateKey: string;
    spPublicCertificate: string;
    path: string;
    issuer: string;
    idpBaseUrl: string;
    samlMetadataPath: string;
  }

  interface IOidcAuthenticationConfiguration {
    enabled: boolean;
    issuer: string;
    client_id: string;
    client_secret: string;
  }

  interface ILocalAuthenticationConfiguration {
    enabled: boolean;
    adminUsername: string;
    adminPassword: string;
  }

  export interface IAuthenticationConfiguration {
    defaultAuthenticationMethod: string;
    samlConfiguration: ISamlAuthenticationConfiguration;
    oidcConfiguration: IOidcAuthenticationConfiguration;
    localConfiguration: ILocalAuthenticationConfiguration;
    sessionStoreConfiguration: ISessionStoreConfiguration;
    applicationCookieConfiguration: IApplicationCookieConfiguration;
  }

  export interface IAuthorizationConfiguration {
    roles: Authorization.IRoles;
  }

  interface IMongoDbSecurityConfiguration {
    uri: string;
  }

  export interface ISecurityConfiguration {
    corsOrigin: Array<string>;
    serverSslCertificate: string;
    serverSslPrivateKey: string;
    authentication: IAuthenticationConfiguration;
    authorization: IAuthorizationConfiguration;
  }

  export interface IApplicationConfiguration {
    name: string;
    port: number;
    logging: ILoggingConfiguration;
    baseUrl: string;
    frontEndBaseUrl: string;
  }

  export interface ISchema {
    app: IApplicationConfiguration;
    security: ISecurityConfiguration;
  }
}
