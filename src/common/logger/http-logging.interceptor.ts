import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(HttpLoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest();
    const response = http.getResponse();

    const method = request.method;
    const url = request.originalUrl ?? request.url;
    const requestId = request.requestId ?? 'unknown';
    const userId = request.user?.userId ?? 'anon';
    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const durationMs = Date.now() - start;
        const statusCode = response.statusCode;
        this.logger.log(
          `[${requestId}] ${method} ${url} ${statusCode} ${durationMs}ms user=${userId}`,
        );
      }),
      catchError((error) => {
        const durationMs = Date.now() - start;
        const statusCode = error?.status ?? response.statusCode ?? 500;

        this.logger.error(
          `[${requestId}] ${method} ${url} ${statusCode} ${durationMs}ms user=${userId}`,
          error?.stack,
        );

        return throwError(() => error);
      }),
    );
  }
}
