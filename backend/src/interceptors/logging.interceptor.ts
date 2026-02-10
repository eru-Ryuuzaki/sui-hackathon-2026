import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();
    const { method, url, body } = request;
    const userAgent = request.get('user-agent') || '';

    const now = Date.now();

    this.logger.log(`Incoming Request: [${method}] ${url} - User-Agent: ${userAgent}`);
    
    // Log body if it exists and is not empty
    if (body && Object.keys(body).length > 0) {
       this.logger.debug(`Request Body: ${JSON.stringify(body, null, 2)}`);
    }

    return next.handle().pipe(
      tap({
        next: (data) => {
          const response = ctx.getResponse();
          const delay = Date.now() - now;
          this.logger.log(
            `Response: [${method}] ${url} - Status: ${response.statusCode} - Duration: ${delay}ms`,
          );
        },
        error: (error) => {
          const delay = Date.now() - now;
          this.logger.error(
            `Request Failed: [${method}] ${url} - Error: ${error.message} - Duration: ${delay}ms`,
            error.stack,
          );
        },
      }),
    );
  }
}
