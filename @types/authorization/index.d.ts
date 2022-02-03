declare namespace Authorization {
  import { Request, Response, NextFunction } from "express";

  export interface IRole {
    name: string;
  }

  export interface IReaderRole extends IRole {}

  export interface IDeveloperRole extends IRole {}

  export interface IContributorRole extends IRole {}

  export interface IAdminRole extends IRole {}

  export interface IRoles {
    admin: IAdminRole;
    contributor: IContributorRole;
    reader: IReaderRole;
    developer: IDeveloperRole;
  }

  export interface IUser {
    username: string;
    roles: Array<IRole> | IRole;
  }

  export interface IAuthenticate {
    authenticateUser(req: Request, res: Response): void;
  }

  export interface IAuthorize {
    protectedRoute(
      req: Request,
      res?: Response,
      next?: NextFunction,
      props?: any
    ): void;
    redirectAuthorizedUser(
      req: Request,
      res: Response,
      next: NextFunction,
      props?: string
    );
  }

  export interface IRestRouteProps extends IAccessControlAllowList {
    allow: Array<IRoles | IUser> | IRole;
  }

  export interface IAuthenticationContext {
    user?: IUser;
    currentRole?: IRole;
    authenticationSource?: IAuthenticationSource;
  }

  export interface IUserRoles {
    contributor: IRole;
    reader: IRole;
  }

  export interface IAccessControlAllowList extends Iterable {
    allow:
      | Array<IRole>
      | Array<IUser>
      | IAuthenticationSource
      | "allAuthenticated";
  }

  export interface IAuthenticationSource {
    provider?: "local" | "saml" | "oidc";
  }
}
