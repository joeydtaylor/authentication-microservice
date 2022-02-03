import { InputType, ObjectType, Field } from "type-graphql";

@ObjectType()
@InputType("ApplicationCookieConfigurationInputs")
export class ApplicationCookieConfiguration
  implements Configuration.IApplicationCookieConfiguration
{
  @Field({ nullable: true })
  signed!: boolean;
  @Field({ nullable: true })
  secure!: boolean;
  @Field({ nullable: true })
  httpOnly!: boolean;
  @Field({ nullable: true })
  sameSite!: "lax" | "strict" | "none";
  @Field({ nullable: true })
  secret!: string;
}

@ObjectType()
@InputType("SessionCookieConfigurationInputs")
class SessionCookieConfiguration
  implements Configuration.ISessionCookieConfiguration
{
  @Field({ nullable: true })
  signed!: boolean;
  @Field({ nullable: true })
  secure!: boolean;
  @Field({ nullable: true })
  httpOnly!: boolean;
  @Field({ nullable: true })
  sameSite!: "lax" | "strict" | "none";
  @Field({ nullable: true })
  name!: string;
  @Field({ nullable: true })
  secret!: string;
  @Field({ nullable: true })
  rememberMeLoginDurationInDays!: number;
  @Field({ nullable: true })
  maxAgeInHours!: number;
}

@ObjectType()
@InputType("SessionStoreConfigurationInputs")
export class SessionStoreConfiguration
  implements Configuration.ISessionStoreConfiguration
{
  @Field({ nullable: true })
  redisConnectionString!: string;
  @Field({ nullable: true })
  cookie!: SessionCookieConfiguration;
  @Field({ nullable: true })
  resave!: boolean;
  @Field({ nullable: true })
  saveUninitialized!: boolean;
}
