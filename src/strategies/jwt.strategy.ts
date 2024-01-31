import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtAuthConfig } from '../config/types/jwt-auth.config';
import { IAuthContext } from '../types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(protected readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<JwtAuthConfig>('jwtAuthConfig').secretKey,
    });
  }

  async validate(payload: any): Promise<IAuthContext> {
    return {
      userId: payload.id,
      email: payload.email,
      username: payload.username,
      role: payload.role,
    };
  }
}
