import express from "express";
import Authentication from "../../controllers/auth/authentication";

module.exports = (app: express.Application) => {
  const { setAuthenticationMethod, localLogin } = new Authentication();

  app.post(
    "/api/auth/local/",
    setAuthenticationMethod({
      provider: "local",
    }),
    localLogin
  );
};
