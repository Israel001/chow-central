import { Logger, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AutomapperModule } from '@automapper/nestjs';
import { classes } from '@automapper/classes';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { OrderModule } from './modules/order/order.module';
import { FoodModule } from './modules/food/food.module';
import { AppController } from './app.controller';
import { AddCorrelationIdInterceptor } from './lib/add-correlation-id-interceptor';
import { TimeoutInterceptor } from './lib/timeout.interceptor';
import { RequestLoggerMiddleware } from './middleware/request-logger-middleware';
import { PrismaModule, loggingMiddleware } from 'nestjs-prisma';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    AutomapperModule.forRoot({
      strategyInitializer: classes(),
    }),
    PrismaModule.forRoot({
      isGlobal: true,
      prismaServiceOptions: {
        middlewares: [
          loggingMiddleware({
            logger: new Logger('PrismaMiddleware'),
            logLevel: 'log',
          }),
        ],
      },
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'images'),
    }),
    UsersModule,
    AuthModule,
    OrderModule,
    FoodModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: AddCorrelationIdInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TimeoutInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
