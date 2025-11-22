import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Request } from 'express';
import { RequestContextService } from './AppRequestContext';
import { randomUUID } from 'crypto';
import * as os from 'os';

@Injectable()
export class ContextInterceptor implements NestInterceptor {
  private instanceName: string;
  private applicationName: string;

  constructor() {
    // Try to get values from config service, or use default values
    this.instanceName = process.env.INSTANCE_NAME || os.hostname();
    this.applicationName = process.env.APP_NAME || 'REUXIE';
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { body?: { requestId?: string } }>();

    /**
     * Setting context information for each request.
     * These values can be used for correlation and logging purposes
     */
    const requestId =
      (request.body as { requestId?: string } | undefined)?.requestId ??
      randomUUID();
    const currentTime = new Date().toISOString();
    const ip = this.extractIp(request);
    const userAgent = request.headers['user-agent'] || 'unknown';

    // Set all context values
    RequestContextService.setRequestId(requestId);
    RequestContextService.setTime(currentTime);
    RequestContextService.setIp(ip);
    RequestContextService.setUserAgent(userAgent);

    return next.handle().pipe(
      tap(() => {
        // Perform cleaning if needed
      }),
    );
  }

  /**
   * Extract IP address from request, handling various header configurations
   */
  private extractIp(request: Request): string {
    const forwardedFor = request.headers['x-forwarded-for'];
    const forwardedIp =
      typeof forwardedFor === 'string' ? forwardedFor.split(',')[0] : undefined;
    return (
      forwardedIp ||
      (request.headers['x-real-ip'] as string | undefined) ||
      request.ip ||
      'unknown'
    );
  }
}
