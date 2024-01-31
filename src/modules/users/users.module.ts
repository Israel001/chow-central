import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthConfiguration } from '../../config/configuration';
import { JwtAuthConfig } from '../../config/types/jwt-auth.config';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    ConfigModule.forRoot({ load: [JwtAuthConfiguration] }),
    JwtModule.registerAsync({
      imports: [ConfigModule.forRoot({ load: [JwtAuthConfiguration] })],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<JwtAuthConfig>('jwtAuthConfig').secretKey,
        signOptions: { expiresIn: '1h' },
      }),
      inject: [ConfigService]
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService]
})
export class UsersModule {}
