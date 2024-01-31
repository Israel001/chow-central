import { SetMetadata } from '@nestjs/common';
import { RoleDecoratorOptionsInterface } from '../types';

export const META_ROLES = 'role';

export const Role = (roleMetadata: RoleDecoratorOptionsInterface) =>
  SetMetadata(META_ROLES, roleMetadata);
