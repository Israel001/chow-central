import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'nestjs-prisma';
import bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async login(user: any) {
    const payload = {
      email: user.email,
      id: user.id,
      username: user.username,
      role: user.role,
    };
    delete user.password;
    delete user.createdAt;
    delete user.updatedAt;
    return {
      accessToken: this.jwtService.sign(payload),
      user,
    };
  }

  async validateUser(usernameOrEmail: string, password: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          {
            username: usernameOrEmail,
          },
          {
            email: usernameOrEmail,
          },
        ],
      },
    });
    if (!user) throw new NotFoundException('User not found');
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) throw new UnauthorizedException('Invalid details');
    return user;
  }
}
