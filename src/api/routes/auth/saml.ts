import express from "express";
import Authentication from "../../controllers/auth/authentication";

module.exports = (app: express.Application) => {
  const { setAuthenticationMethod } = new Authentication();

  app.get(
    "/api/auth/saml/login",
    setAuthenticationMethod({ provider: "saml" })
  );

  app.post(
    "/api/auth/saml/consume",
    setAuthenticationMethod({ provider: "saml" })
  );
};
