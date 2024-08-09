declare module '@okta/oidc-middleware' {
  import { Request, Response, NextFunction } from 'express';

  interface ExpressOIDCConstructor {
    issuer: string;
    client_id: string;
    client_secret: string;
    appBaseUrl: string;
    response_type: string;
    scope: string;
    routes?: {
      login?: {
        path: string;
      };
      loginCallback?: {
        path: string;
        afterCallback?: string;
        handler?: (req: Request, res: Response, next: NextFunction) => void;
      };
    };
  }

  class ExpressOIDC {
    constructor(options: ExpressOIDCConstructor);
    router: any;
  }

  export { ExpressOIDC };
}
