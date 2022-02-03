import { Request, Response, NextFunction } from "express";
import { Sealed, ApplyConfiguration } from "../../../helpers/configuration";
import Authentication from "./authentication";

@Sealed
@ApplyConfiguration()
export class Authorization implements Authorization.IAuthorize {
  public app!: Configuration.IApplicationConfiguration;
  private security!: Configuration.ISecurityConfiguration;

  public protectedRoute = (
    req: Request,
    res: Response,
    next: NextFunction,
    props: Authorization.IAccessControlAllowList
  ): void => {
    const { authenticateUser } = new Authentication();

    authenticateUser(req, res);
    this.authorizeUser(req, res, next, props);
  };

  public redirectAuthorizedUser = (
    req: Request,
    res: Response,
    next: NextFunction,
    _path?: string
  ): void => {
    this.protectedRoute(req, res, next, {
      allow: "allAuthenticated",
    });
    req.user && _path
      ? res.redirect(_path)
      : req.user && !_path
      ? res.redirect(this.app.frontEndBaseUrl)
      : res.redirect(this.app.frontEndBaseUrl + "/login");
  };

  private authorizeUser = (
    req: Request,
    res: Response,
    next?: NextFunction,
    props?: Authorization.IAccessControlAllowList | any
  ): void => {
    (req.user && props.allow?.includes(req.user.role || req.user.username)) ||
    (req.user &&
      req.user.role === this.security.authorization.roles.admin.name) ||
    (req.user && props.allow === "allAuthenticated")
      ? next
        ? next()
        : req.user.isAuthorized === true
      : res.status(401).json({
          type: "error",
          message: "Unauthorized",
        } as Service.JsonMessageContext);
  };

  public getUserContext = (req: Request, res: Response): void => {
    if (req.userContext) {
      res.status(200).json({
        username: req.userContext.username,
        authenticationSource: {
          provider: req.userContext.authenticationSource,
        },
        role: {
          name: req.userContext.role,
        },
      });
    } else {
      res.status(401).json({
        message: "Unauthorized",
        type: "error",
      } as Service.JsonMessageContext);
    }
  };
}

export default Authorization;
