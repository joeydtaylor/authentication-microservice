import { Logger as SplunkLogger } from "splunk-logging";
import path from "path";
import fs from "fs";
import express, { Request, Response } from "express";
import morgan from "morgan";
import { globalConfiguration } from "../../helpers/configuration";

const logDir = path.join(
  __dirname,
  "/../../../" + globalConfiguration.app.logging.logDir
);
const httpLogFileName = "http-access.log";
const rfs = require("rotating-file-stream");

module.exports = (app: express.Application, config: Configuration.ISchema) => {
  fs.existsSync(logDir) || fs.mkdirSync(logDir);

  morgan.token("time", () => {
    return new Date().toISOString();
  });
  morgan.token("remote-user", (req: Request) => {
    return req.user ? req.user.username : undefined;
  });
  morgan.token("remote-user-role", (req: Request) => {
    return req.user ? req.user.role : undefined;
  });
  morgan.token("authentication-source", (req: Request) => {
    return req.user ? req.user.authenticationSource : undefined;
  });
  morgan.token("change", (_req: never, res: any) => {
    return res ? res.data : undefined;
  });
  morgan.token("requestData", (req: Request) => {
    return (req.body && req.body.password) ||
      (req.body && req.body.operationName === "IntrospectionQuery")
      ? undefined
      : req.body && !req.body.password
      ? req.body
      : undefined;
  });
  morgan.token("sessionID", (req: Request) => {
    return req.session ? req.sessionID : undefined;
  });

  const fileStream = (filePath: string) => {
    return rfs.createStream(filePath, {
      path: path.join(logDir),
      maxSize: config.app.logging.logMaxSizeInNumberMB,
      rotate: config.app.logging.logMaxFilecount,
      interval: "1h",
      intervalBoundary: true,
      teeToStdout: true,
    });
  };

  app.use(
    morgan(
      (tokens: any, req: Request, res: Response) => {
        return JSON.stringify({
          time: tokens["time"](req, res),
          remoteAddress: tokens["remote-addr"](req, res),
          remoteUser: tokens["remote-user"](req, res),
          authenticationSource: tokens["authentication-source"](req, res),
          session: tokens["sessionID"](req, res),
          remoteUserRole: tokens["remote-user-role"](req, res),
          httpMethod: tokens["method"](req, res),
          endpoint: tokens["url"](req, res),
          status: tokens["status"](req, res),
          change: tokens["change"](req, res),
          requestData: tokens["requestData"](req, res),
          responseTimeInMs: tokens["response-time"](req, res),
        });
      },
      {
        stream: {
          write: (str) => {
            fileStream(httpLogFileName).write(str);
            if (globalConfiguration.app.logging.splunkLogging.enabled) {
              new SplunkLogger({
                token: globalConfiguration.app.logging.splunkLogging.token,
                url: globalConfiguration.app.logging.splunkLogging.url,
              }).send(
                {
                  message: {
                    str,
                  },
                },
                (err, _res, _body) => {
                  if (err) {
                    console.log(err);
                  }
                }
              );
            }
          },
        },
      }
    )
  );
};
