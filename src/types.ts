export enum OrderDir {
  ASC = 'asc',
  DESC = 'desc',
}

export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export enum OrderStatus {
  PAID = 'PAID',
  UNPAID = 'UNPAID'
}

export interface IAuthContext {
  email: string;
  username: string;
  userId: number;
  role: Role;
}

export interface RoleDecoratorOptionsInterface {
  roles: string[];
}