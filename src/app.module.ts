import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { LoggerMiddleware } from "./core/logger.middleware";
import { DatabaseModule } from "./database/database.module";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { UserModule } from "./user/user.module";
import { ResponseModel } from "./responseModel";
import { AuthModule } from "./auth/auth.module";

import { ScheduleModule } from "@nestjs/schedule";
import { LoggingInterceptor } from "./core/logging-interceptor";

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        // configuration
      ],
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        ttl: config.get("THROTTLE_TTL"),
        limit: config.get("THROTTLE_LIMIT"),
      }),
    }),

    // CacheModule.register({
    //   isGlobal: true,
    //   ttl: 60,
    //   max: 1000,
    //   store: redisStore,
    //   socket: {
    //     host: '127.0.0.1', //process.env.REDIS_HOST,
    //     port: 6379, //process.env.REDIS_PORT,
    //   },
    // }),

    DatabaseModule,
    UserModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    ResponseModel,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: CacheInterceptor,
    // },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // consumer.apply(LoggerMiddleware, customInputValidation).forRoutes('/**');
    consumer.apply(LoggerMiddleware).forRoutes("/**");
  }
}
