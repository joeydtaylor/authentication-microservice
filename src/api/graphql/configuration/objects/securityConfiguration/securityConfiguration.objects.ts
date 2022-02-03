import { InputType, ObjectType, Field, Authorized } from "type-graphql";
import { globalConfiguration } from "../../../../../helpers/configuration";
import AuthenticationConfiguration from "./authenticationConfiguration/authenticationConfiguration.objects";
import AuthorizationConfiguration from "./authorizationConfiguration/authorizationConfiguration.objects";

@ObjectType()
@InputType("SecurityConfigurationInputs")
class SecurityConfiguration implements Configuration.ISecurityConfiguration {
  @Authorized({
    allow: [
      {
        name: globalConfiguration.security.authorization.roles.admin.name,
      },
    ],
  })
  @Field(() => [String], { nullable: true })
  corsOrigin!: string[];
  @Authorized({
    allow: [
      {
        name: globalConfiguration.security.authorization.roles.admin.name,
      },
    ],
  })
  @Field({ nullable: true })
  serverSslCertificate!: string;
  @Authorized({
    allow: [
      {
        name: globalConfiguration.security.authorization.roles.admin.name,
      },
    ],
  })
  @Field({ nullable: true })
  serverSslPrivateKey!: string;
  @Field({ nullable: true })
  authentication!: AuthenticationConfiguration;
  @Authorized({
    allow: [
      {
        name: globalConfiguration.security.authorization.roles.admin.name,
      },
    ],
  })
  @Field({ nullable: true })
  authorization!: AuthorizationConfiguration;
}

export default SecurityConfiguration;
