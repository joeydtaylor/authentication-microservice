declare namespace Service {
  
  export interface IGraphQLContext
    extends Authorization.IAuthenticationContext {}

  export type JsonMessageContext = {
    type: "success" | "error";
    message: "Unauthorized" | "Transaction successful";
    data: any;
  };

}
