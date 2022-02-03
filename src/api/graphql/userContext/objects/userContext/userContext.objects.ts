import { ObjectType, Field } from "type-graphql";

@ObjectType()
class UserContextAuthenticationSource
  implements Authorization.IAuthenticationSource
{
  @Field({ nullable: false })
  provider?: "local" | "saml" | "oidc";
}

@ObjectType()
class UserContextRole implements Authorization.IRole {
  @Field({ nullable: false })
  name!: string;
}

@ObjectType()
class UserContext implements Authorization.IAuthenticationContext {
  @Field({ nullable: false })
  username?: string;
  @Field({ nullable: false })
  authenticationSource?: UserContextAuthenticationSource;
  @Field({ nullable: false })
  role?: UserContextRole;
}

export default UserContext;
