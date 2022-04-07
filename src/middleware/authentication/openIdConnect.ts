const ExpressOIDC = require("@okta/oidc-middleware").ExpressOIDC;
import express, { Request, Response, NextFunction } from "express";

module.exports = (app: express.Application, config: Configuration.ISchema) => {
  const oidc = new ExpressOIDC({
    issuer: config.security.authentication.oidcConfiguration.issuer,
    client_id: config.security.authentication.oidcConfiguration.client_id,
    client_secret:
      config.security.authentication.oidcConfiguration.client_secret,
    appBaseUrl: `${config.app.baseUrl}`,
    response_type: "access_token",
    scope: "openid profile groups",
    routes: {
      login: {
        path: "/api/auth/oidc/login",
      },
      loginCallback: {
        path: "/api/auth/oidc/",
        handler: (_req: Request, _res: Response, next: NextFunction) => {
          next();
        },
        afterCallback: "/",
      },
    },
  });

  app.use(oidc.router);
};
