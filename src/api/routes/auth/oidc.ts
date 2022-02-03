import express from "express";
import Authentication from "../../controllers/auth/authentication";

module.exports = (app: express.Application) => {
  const { setAuthenticationMethod } = new Authentication();

  app.get("/api/auth/oidc", setAuthenticationMethod({ provider: "oidc" }));
};
