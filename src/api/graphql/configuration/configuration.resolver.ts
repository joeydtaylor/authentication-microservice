import {
  Resolver,
  Query,
  InputType,
  ObjectType,
  Field,
} from "type-graphql";

import { globalConfiguration } from "../../../helpers/configuration";
import ApplicationConfiguration from "./objects/applicationConfiguration/applicationConfiguration.objects";
import SecurityConfiguration from "./objects/securityConfiguration/securityConfiguration.objects";

@ObjectType()
@InputType("ConfigurationInputs")
class Configuration implements Configuration.ISchema {
  @Field({ nullable: true })
  app!: ApplicationConfiguration;
  @Field({ nullable: true })
  security!: SecurityConfiguration;
}

@Resolver()
class ConfigurationResolver {
  @Query()
  getConfiguration(): Configuration {
    return { ...globalConfiguration };
  }
}

export default ConfigurationResolver;
