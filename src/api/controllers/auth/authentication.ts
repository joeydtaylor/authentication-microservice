import { Request, Response } from "express";
import { Frozen, ApplyConfiguration } from "../../../helpers/configuration";
import passport from "passport";

@Frozen
@ApplyConfiguration()
export class Authentication implements Authorization.IAuthenticate {
  public app!: Configuration.IApplicationConfiguration;
  private security!: Configuration.ISecurityConfiguration;

  public localLogin = (req: Request, res: Response): void => {
    let { cookie } = this.security.authentication.sessionStoreConfiguration;

    req.body.rememberMe
      ? (req.session.cookie.maxAge =
          cookie.rememberMeLoginDurationInDays * 24 * 60 * 60 * 1000)
      : undefined;

    this.authenticateUser(req, res);

    res.status(200).json({ type: "success", message: "Login successful" });
  };

  public logout = (req: Request, res: Response): void => {
    req.session.destroy((err) => {
      if (err) {
        res.redirect(`${this.app.frontEndBaseUrl}/login`);
        console.log({
          message: `Failed to log ${req.user.username} out`,
          type: "error",
          data: { ...err },
        });
      }
    });
    res.clearCookie("s");
    res.status(200).json({
      message: "successfully logged out",
      type: "success",
    });
  };

  public setAuthenticationMethod = (
    options: Authorization.IAuthenticationSource
  ): any => {
    switch (options.provider) {
      case "saml":
        return passport.authenticate(
          this.security.authentication.samlConfiguration.strategy,
          {
            session: true,
            failureRedirect: "/api",
            successRedirect: "/api",
            failureFlash: true,
          }
        );
      case "oidc":
        return (_req: Request, res: Response) => {
          res.redirect("/api");
        };
      default:
        return passport.authenticate("local", {
          session: true,
        });
    }
  };

  public authenticateUser = (req: Request, res: Response): void => {
    this.authenticateSession(req, res);
    this.attachGroups(req);
  };

  private authenticateSession = (req: Request, res: Response): void => {
    if (req.isAuthenticated()) {
      req.user && req.user.username
        ? (req.user.authenticationSource = "local")
        : req.user && req.user.nameID
        ? (req.user.authenticationSource = "saml")
        : req.user && req.user.userinfo
        ? (req.user.authenticationSource = "oidc")
        : undefined;
    } else {
      res.redirect(`${this.app.frontEndBaseUrl}/login`);
    }
  };

  private attachGroups = (req: Request): void => {
    const { admin, contributor, developer, reader }: Authorization.IRoles =
      this.security.authorization.roles;
    if (req.user) {
      let currentGroups = undefined;
      switch (req.user.authenticationSource) {
        case "saml":
          req.user.username = req.user.nameID;
          currentGroups = req.user.role;
          break;
        case "local":
          currentGroups = req.user.role;
          break;
        case "oidc":
          req.user.username = req.user.userinfo.preferred_username;
          currentGroups = req.user.userinfo.groups;
          break;
        default:
          req.user.username = undefined;
          break;
      }

      req.user.roles = Array.isArray(currentGroups)
        ? [...currentGroups]
        : currentGroups;

      req.user.role = req.user.roles.includes(admin.name)
        ? admin.name
        : req.user.roles.includes(contributor.name)
        ? contributor.name
        : req.user.roles.includes(developer.name)
        ? developer.name
        : req.user.roles.includes(reader.name)
        ? reader.name
        : undefined;
    }
  };
}

export default Authentication;
