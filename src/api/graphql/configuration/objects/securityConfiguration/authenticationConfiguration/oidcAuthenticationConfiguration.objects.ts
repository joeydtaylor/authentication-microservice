import { InputType, ObjectType, Field, Authorized } from "type-graphql";
import { globalConfiguration } from "../../../../../../helpers/configuration";

@ObjectType()
@InputType("OidcAuthenticationConfigurationInputs")
class OidcAuthenticationConfiguration
  implements Configuration.IOidcAuthenticationConfiguration
{
  @Field({ nullable: true })
  enabled!: boolean;
  @Authorized({
    allow: [
      {
        name: globalConfiguration.security.authorization.roles.admin.name,
      },
    ],
  })
  @Field({ nullable: true })
  issuer!: string;
  @Authorized({
    allow: [
      {
        name: globalConfiguration.security.authorization.roles.admin.name,
      },
    ],
  })
  @Field({ nullable: true })
  client_id!: string;
  @Authorized({
    allow: [
      {
        name: globalConfiguration.security.authorization.roles.admin.name,
      },
    ],
  })
  @Field({ nullable: true })
  client_secret!: string;
}

export default OidcAuthenticationConfiguration;
