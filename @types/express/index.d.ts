declare namespace Express {
  export interface Request {
    user?: any;
    headers?: any;
    sessionExpires?: Date;
    rememberMe?: boolean;
    files?: fileUpload.FileArray;
    userContext?: configuration.IUserContext;
  }

  export interface Response {
    change?: any;
  }
}
