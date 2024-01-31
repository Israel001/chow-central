import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { META_ROLES } from '../decorators/roles.decorator';
import { RoleDecoratorOptionsInterface } from '../types';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const rolesMetadatas: RoleDecoratorOptionsInterface[] = [];
    const roleMetadata =
      this.reflector.getAllAndOverride<RoleDecoratorOptionsInterface>(
        META_ROLES,
        [context.getClass(), context.getHandler()],
      );
    if (roleMetadata) rolesMetadatas.push(roleMetadata);
    const combinedRoles = rolesMetadatas.flatMap((x) => x.roles);
    if (!combinedRoles.length) return true;
    const request = context.switchToHttp().getRequest();
    return combinedRoles.some(
      (r) => r.toLowerCase() === request.user.role.toLowerCase(),
    );
  }
}
