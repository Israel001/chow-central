import { IsString } from "class-validator";

export class LoginDTO {
  @IsString()
  usernameOrEmail: string;

  @IsString()
  password: string;
}