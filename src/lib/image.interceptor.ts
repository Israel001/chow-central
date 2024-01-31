import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class ImageInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    const request = context.switchToHttp().getRequest();
    // extract files into the request body as processable object
    if (request.files) {
      Object.entries(request.files).forEach(([k, v]) => {
        request.body[k] =
          (v as any).length > 1 || k === 'images'
            ? (v as any).map((e: any) => e.filename).join(',')
            : v[0].filename;
      });
    }
    return next.handle();
  }
}
