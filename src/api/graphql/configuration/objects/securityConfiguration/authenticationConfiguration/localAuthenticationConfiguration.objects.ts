import { InputType, ObjectType, Field, Authorized } from "type-graphql";
import { globalConfiguration } from "../../../../../../helpers/configuration";

@ObjectType()
@InputType("LocalAuthenticationConfigurationInputs")
class LocalAuthenticationConfiguration
  implements Configuration.ILocalAuthenticationConfiguration
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
  adminUsername!: string;
  @Authorized({
    allow: [
      {
        name: globalConfiguration.security.authorization.roles.admin.name,
      },
    ],
  })
  @Field({ nullable: true })
  adminPassword!: string;
}

export default LocalAuthenticationConfiguration;
