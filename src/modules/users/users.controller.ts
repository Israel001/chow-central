import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './users.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth-guard';

@Controller('users')
@ApiTags('users')
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  signup(@Body() body: CreateUserDto) {
    return this.usersService.createUser(body);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  getUserDetails(@Req() request: any) {
    return this.usersService.getUserDetails(request.user as any);
  }
}
