import { InputType, ObjectType, Field } from "type-graphql";
import ApplicationConfiguration from "./applicationConfiguration/applicationConfiguration.objects";
import SecurityConfiguration from "./securityConfiguration/securityConfiguration.objects";

@ObjectType()
@InputType("ConfigurationInputs")
class Configuration implements Configuration.ISchema {
  @Field({ nullable: true })
  app!: ApplicationConfiguration;
  @Field({ nullable: true })
  security!: SecurityConfiguration;
}

export default Configuration;
