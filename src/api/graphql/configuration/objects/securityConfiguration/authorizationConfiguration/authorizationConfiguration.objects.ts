import { InputType, ObjectType, Field } from "type-graphql";

@ObjectType()
@InputType("RoleInputs")
class Role implements Authorization.IRole {
  @Field({ nullable: true })
  name!: string;
}

@ObjectType()
@InputType("RolesInputs")
class Roles implements Authorization.IRoles {
  @Field({ nullable: true })
  admin!: Role;
  @Field({ nullable: true })
  contributor!: Role;
  @Field({ nullable: true })
  reader!: Role;
  @Field({ nullable: true })
  developer!: Role;
}

@ObjectType()
@InputType("AuthorizationConfigurationInputs")
class AuthorizationConfiguration
  implements Configuration.IAuthorizationConfiguration
{
  @Field({ nullable: true })
  roles!: Roles;
}

export default AuthorizationConfiguration;
