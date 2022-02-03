import { Resolver, Query, Ctx, Authorized } from "type-graphql";
import UserContext from "./objects/userContext/userContext.objects";

const getUserContextAcl: Authorization.IAccessControlAllowList = {
  allow: "allAuthenticated",
};
@Resolver()
class UserContextResolver {
  @Authorized({ ...getUserContextAcl })
  @Query()
  getUserContext(@Ctx() ctx: Service.IGraphQLContext): UserContext {
    return {
      username: ctx.user?.username,
      role: ctx.currentRole,
      authenticationSource: ctx.authenticationSource,
    };
  }
}

export default UserContextResolver;
