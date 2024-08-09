import { ExpressOIDC } from "@okta/oidc-middleware";
import express from "express";

module.exports = (app: express.Application, config: Configuration.ISchema) => {
  const { issuer, client_id, client_secret } = config.security.authentication.oidcConfiguration;
  const { baseUrl } = config.app;

  const oidc = new ExpressOIDC({
    issuer,
    client_id,
    client_secret,
    appBaseUrl: baseUrl,
    response_type: "access_token",
    scope: "openid profile groups",
    routes: {
      login: {
        path: "/api/auth/oidc/login",
      },
      loginCallback: {
        path: "/api/auth/oidc/",
        afterCallback: "/",  // Redirects to '/' after successful login
      },
    },
  });

  app.use(oidc.router);
}
