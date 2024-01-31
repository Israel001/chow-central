import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../modules/auth/auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({ usernameField: 'usernameOrEmail' });
  }

  async validate(usernameOrEmail: string, password: string) {
    return this.authService.validateUser(usernameOrEmail, password);
  }
}
