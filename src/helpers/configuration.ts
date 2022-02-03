import config from "../config/config";

config.security.corsOrigin = [...config.security.corsOrigin];

if (process.env.NODE_ENV !== "production") {
  config.security.corsOrigin.push("https://studio.apollographql.com");
}
config.security.authentication.samlConfiguration.idpBaseUrl &&
  config.security.corsOrigin.push(
    config.security.authentication.samlConfiguration.idpBaseUrl
  );
config.security.authentication.oidcConfiguration.issuer &&
  config.security.corsOrigin.push(
    config.security.authentication.oidcConfiguration.issuer
  );
config.security.corsOrigin.push(config.app.baseUrl);
config.security.corsOrigin.push(config.app.frontEndBaseUrl);

export const Sealed = (constructor: Function) => {
  Object.seal(constructor);
  Object.seal(constructor.prototype);
};

export const ApplyConfiguration =
  (_options?: any[]) =>
  <T extends { new (...args: any[]): {} }>(constructor: T) => {
    class ApplicationConfiguration extends constructor {
      app: Configuration.IApplicationConfiguration = config.app;
    }

    class SecurityConfiguration extends ApplicationConfiguration {
      security: Configuration.ISecurityConfiguration = config.security;
    }

    return Reflect.getOwnPropertyDescriptor(constructor, "name")?.value ===
      "Authentication" || "Authorization"
      ? class extends SecurityConfiguration {}
      : class extends ApplicationConfiguration {};
  };

@ApplyConfiguration()
class GlobalConfiguration implements Configuration.ISchema {
  app!: Configuration.IApplicationConfiguration;
  security!: Configuration.ISecurityConfiguration;
}

export const globalConfiguration = new GlobalConfiguration();

module.exports = {
  Sealed,
  ApplyConfiguration,
  globalConfiguration,
};
