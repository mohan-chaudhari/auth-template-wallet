import { BadRequestException, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import cookieParser from "cookie-parser";
import compression from "compression";
import helmet from "helmet";
import csurf from "csurf";
import xssClean from "xss-clean";
import hpp from "hpp";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./core/httpexception.filter";
import { ValidationError } from "class-validator";
import { csrfExcludeRoutes } from "../shared/constants";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const origin = process.env.ORIGIN;

  const ignoreMethods =
    process.env.STAGE == "dev"
      ? ["GET", "HEAD", "OPTIONS", "DELETE", "POST", "PATCH", "PUT"]
      : ["GET", "HEAD", "OPTIONS", "DELETE"];
  const csrfProtection = csurf({
    cookie: {
      httpOnly: true,
      secure: true,
      maxAge: 300,
      // sameSite: 'none',
    },
    ignoreMethods,
  });
  app.set("trust proxy", 1);
  app.setGlobalPrefix("/api/v1");

  app.use(cookieParser());
  app.use(compression());

  app.enableCors({
    credentials: true,
    origin: ["http://localhost:3000"],
  });

  // comment from here
  app.use((req, res, next) => {
    if (csrfExcludeRoutes.includes(req.path)) {
      return next();
    }
    csrfProtection(req, res, next);
  });

  app.use((req: any, res: any, next: any) => {
    if (req.csrfToken) {
      const token = req.csrfToken();
      res.cookie("XSRF-TOKEN", token, {
        httpOnly: true,
        secure: true,
        // domain: "xyz.com",
      });

      const corsWhitelist = ["http://localhost:3000"];
      if (corsWhitelist.includes(req.headers.origin)) {
        res.setHeader("Access-Control-Allow-Origin", req.headers.origin);
        res.setHeader("Access-Control-Allow-Credentials", true);
      }
      res.locals.csrfToken = token;
    }

    next();
  });

  // comment till here for swagger in local

  app.use(
    helmet({
      hsts: {
        includeSubDomains: true,
        preload: true,
        maxAge: 63072000,
      },
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          defaultSrc: [
            "'self'",
            // "data:",
            // "blob:",
            "https://polyfill.io",
            "https://*.cloudflare.com",
            "http://127.0.0.1:3000/",
            // "ws:",
          ],
          baseUri: ["'self'"],
          scriptSrc: [
            "'self'",
            "http://127.0.0.1:3000/",
            "https://*.cloudflare.com",
            "https://polyfill.io",
            // "http:",
            // "data:",
          ],
          styleSrc: ["'self'", "https:", "http:", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "blob:"],
          fontSrc: ["'self'", "https:", "data:"],
          childSrc: ["'self'", "blob:"],
          styleSrcAttr: ["'self'", "'unsafe-inline'", "http:"],
          frameSrc: ["'self'"],
        },
      },
    })
  );

  app.use(helmet.contentSecurityPolicy());
  app.use(helmet.crossOriginEmbedderPolicy());
  app.use(helmet.crossOriginOpenerPolicy());
  app.use(helmet.crossOriginResourcePolicy());
  app.use(helmet.dnsPrefetchControl());
  app.use(helmet.expectCt());
  app.use(helmet.frameguard());
  app.use(helmet.hidePoweredBy());
  app.use(helmet.ieNoOpen());
  app.use(helmet.noSniff());
  app.use(helmet.originAgentCluster());
  app.use(
    helmet.permittedCrossDomainPolicies({
      permittedPolicies: "by-content-type",
    })
  );
  app.use(helmet.referrerPolicy());
  app.use(helmet.xssFilter());
  app.use(xssClean());
  app.use(hpp());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        return new BadRequestException(validationErrors);
      },
    })
  );

  // NOTE: Setup Swagger docs
  if (["dev", "staging", "uat"].includes(process.env.STAGE)) {
    const config = new DocumentBuilder()
      .addBearerAuth()
      .addOAuth2()
      .setTitle("Project title")
      .setDescription("Project description")
      .setVersion("1.0")
      .build();

    const document = SwaggerModule.createDocument(app, config, {
      ignoreGlobalPrefix: false,
    });
    SwaggerModule.setup("api", app, document, {
      swaggerOptions: {
        tagsSorter: "alpha",
        //  operationsSorter: 'alpha',
      },
    });
  }

  const port = process.env.PORT || 3000;
  await app.listen(port, () => {
    console.log("Server started on port: " + port);
  });
}
bootstrap();
