import { InputType, ObjectType, Field, Authorized } from "type-graphql";
import { ApplyConfiguration } from "../../../../../helpers/configuration";

@ApplyConfiguration()
class GlobalConfiguration implements Configuration.ISchema {
  app!: Configuration.IApplicationConfiguration;
  security!: Configuration.ISecurityConfiguration;
}

const globalConfiguration = new GlobalConfiguration();

@ObjectType()
@InputType("SplunkLoggingConfigurationInputs")
class SplunkLoggingConfiguration
  implements Configuration.ISplunkLoggingConfiguration
{
  @Field({ nullable: true })
  enabled!: boolean;
  @Field({ nullable: true })
  token!: string;
  @Field({ nullable: true })
  url!: string;
}

@ObjectType()
@InputType("LoggingConfigurationInputs")
class LoggingConfiguration implements Configuration.ILoggingConfiguration {
  @Field({ nullable: true })
  logDir!: string;
  @Field({ nullable: true })
  logRetentionInDays!: number;
  @Field({ nullable: true })
  logMaxSizeInNumberMB!: string;
  @Field({ nullable: true })
  logMaxFilecount!: number;
  @Field({ nullable: true })
  splunkLogging!: SplunkLoggingConfiguration;
}

@ObjectType()
@InputType("ApplicationConfigurationInputs")
class ApplicationConfiguration
  implements Configuration.IApplicationConfiguration
{
  @Field({ nullable: true })
  name!: string;
  @Field({ nullable: true })
  port!: number;
  @Authorized({
    allow: [
      {
        name: globalConfiguration.security.authorization.roles.admin.name,
      },
    ],
  })
  @Field({ nullable: true })
  logging!: LoggingConfiguration;
  @Field({ nullable: true })
  baseUrl!: string;
  @Field({ nullable: true })
  frontEndBaseUrl!: string;
}

export default ApplicationConfiguration;
