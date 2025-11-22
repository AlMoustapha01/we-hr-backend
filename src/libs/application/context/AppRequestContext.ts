import { RequestContext } from 'nestjs-request-context';

/**
 * Setting some isolated context for each request.
 */

export class AppRequestContext {
  requestId: string;
  time: string;
  ip: string;
  userAgent: string;
}

interface RequestWithContext {
  [key: string]: unknown;
}

interface ContextHolder {
  req?: RequestWithContext;
}

export class RequestContextService {
  private static readonly CONTEXT_KEY = 'appRequestContext';

  private static globalContext: AppRequestContext;

  static getContext(): AppRequestContext {
    // If we are outside an HTTP request (e.g., in a CLI/script),
    // RequestContext.currentContext or its `req` property may be undefined.
    const ctxHolder = (
      RequestContext as unknown as { currentContext?: ContextHolder }
    ).currentContext;
    if (!ctxHolder || !ctxHolder.req) {
      // Return (and lazily create) a singleton fallback context
      if (!this.globalContext) {
        this.globalContext = new AppRequestContext();
        this.globalContext.requestId = 'system';
        this.globalContext.time = new Date().toISOString();
      }
      return this.globalContext;
    }

    const req = ctxHolder.req;
    // Initialize custom context object if it doesn't exist
    if (!req[this.CONTEXT_KEY]) {
      req[this.CONTEXT_KEY] = new AppRequestContext();
    }
    return req[this.CONTEXT_KEY] as AppRequestContext;
  }

  static setRequestId(id: string): void {
    const ctx = this.getContext();
    ctx.requestId = id;
  }

  static getRequestId(): string {
    return this.getContext().requestId;
  }

  static setTime(time: string): void {
    const ctx = this.getContext();
    ctx.time = time;
  }

  static getTime(): string {
    return this.getContext().time;
  }

  static setIp(ip: string): void {
    const ctx = this.getContext();
    ctx.ip = ip;
  }

  static getIp(): string {
    return this.getContext().ip;
  }

  static setUserAgent(userAgent: string): void {
    const ctx = this.getContext();
    ctx.userAgent = userAgent;
  }

  static getUserAgent(): string {
    return this.getContext().userAgent;
  }
}
