import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthConfiguration } from '../../config/configuration';
import { JwtAuthConfig } from '../../config/types/jwt-auth.config';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

@Module({
  imports: [
    ConfigModule.forRoot({ load: [JwtAuthConfiguration] }),
    JwtModule.registerAsync({
      imports: [ConfigModule.forRoot({ load: [JwtAuthConfiguration] })],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<JwtAuthConfig>('jwtAuthConfig').secretKey,
        signOptions: { expiresIn: '1h' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService]
})
export class OrderModule {}
