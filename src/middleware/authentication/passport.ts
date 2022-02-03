import fs from "fs";
import path from "path";
import { MetadataReader, toPassportConfig } from "passport-saml-metadata";
import { Strategy as SamlStrategy } from "passport-saml";
import { Strategy as LocalStrategy } from "passport-local";
import passport from "passport";
import { globalConfiguration } from "../../helpers/configuration";

interface User {
  username?: string;
  role?: Array<string>;
  authenticationMethod?: string;
}

module.exports = (
  passport: passport.Authenticator,
  config: Configuration.ISchema
) => {
  let reader;
  let idpConfig: any = undefined;
  let spConfig: any = undefined;
  let strategyConfig: any = undefined;

  if (
    fs.existsSync(
      path.join(
        __dirname,
        `../../../${globalConfiguration.security.authentication.samlConfiguration.samlMetadataPath}`
      )
    )
  ) {
    reader = new MetadataReader(
      fs.readFileSync(
        path.join(
          __dirname,
          `../../../${globalConfiguration.security.authentication.samlConfiguration.samlMetadataPath}`
        ),
        "utf8"
      )
    );
    idpConfig = toPassportConfig(reader);

    spConfig = {
      path: config.security.authentication.samlConfiguration.path,
      issuer: config.security.authentication.samlConfiguration.issuer,
    };
  }

  strategyConfig = {
    ...idpConfig,
    ...spConfig,
  };

  config.security.authentication.samlConfiguration.enabled &&
    fs.existsSync(
      path.join(
        __dirname,
        `../../../${globalConfiguration.security.authentication.samlConfiguration.samlMetadataPath}`
      )
    ) &&
    passport.use(
      new SamlStrategy(strategyConfig, (user: any, done: any) => {
        return done(null, user);
      })
    );

  passport.use(
    new LocalStrategy((username: string, password: string, done: any) => {
      let user: User = {
        username: username,
        role: [globalConfiguration.security.authorization.roles.admin.name],
        authenticationMethod: "local",
      };
      if (
        username ===
          config.security.authentication.localConfiguration.adminUsername &&
        password ===
          config.security.authentication.localConfiguration.adminPassword &&
        config.security.authentication.localConfiguration.enabled
      ) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    })
  );

  passport.serializeUser((user: User, done: any) => {
    done(null, user);
  });
  passport.deserializeUser((user: User, done: any) => {
    done(null, user);
  });
};
