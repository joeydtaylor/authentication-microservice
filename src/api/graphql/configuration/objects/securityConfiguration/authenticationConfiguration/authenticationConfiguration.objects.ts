import { InputType, ObjectType, Field, Authorized } from "type-graphql";
import { ApplyConfiguration } from "../../../../../../helpers/configuration";
import {
  SessionStoreConfiguration,
  ApplicationCookieConfiguration,
} from "../cookieConfiguration/cookieConfiguration.objects";
import LocalAuthenticationConfiguration from "./localAuthenticationConfiguration.objects";
import OidcAuthenticationConfiguration from "./oidcAuthenticationConfiguration.objects";
import SamlAuthenticationConfiguration from "./samlAuthenticationConfiguration.objects";

@ApplyConfiguration()
class GlobalConfiguration implements Configuration.ISchema {
  app!: Configuration.IApplicationConfiguration;
  security!: Configuration.ISecurityConfiguration;
}

const globalConfiguration = new GlobalConfiguration();

@ObjectType()
@InputType("AuthenticationConfigurationInputs")
class AuthenticationConfiguration
  implements Configuration.IAuthenticationConfiguration
{
  @Field({ nullable: true })
  defaultAuthenticationMethod!: string;
  @Field({ nullable: true })
  samlConfiguration!: SamlAuthenticationConfiguration;
  @Field({ nullable: true })
  oidcConfiguration!: OidcAuthenticationConfiguration;
  @Field({ nullable: true })
  localConfiguration!: LocalAuthenticationConfiguration;
  @Authorized({
    allow: [
      {
        name: globalConfiguration.security.authorization.roles.admin.name,
      },
    ],
  })
  @Field({ nullable: true })
  sessionStoreConfiguration!: SessionStoreConfiguration;
  @Authorized({
    allow: [
      {
        name: globalConfiguration.security.authorization.roles.admin.name,
      },
    ],
  })
  @Field({ nullable: true })
  applicationCookieConfiguration!: ApplicationCookieConfiguration;
}

export default AuthenticationConfiguration;
