import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { Observable, tap } from 'rxjs';
import { sanitizeLogPayload } from '../../../infrastructure/logging/log-sanitizer';

@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  constructor(
    @InjectPinoLogger(RequestLoggingInterceptor.name)
    private readonly logger: PinoLogger,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();
    const startedAt = Date.now();
    const handlerContext = this.getHandlerContext(context, request);

    this.logger.info(handlerContext, 'HTTP handler started');

    return next.handle().pipe(
      tap((result) => {
        this.logger.info(
          {
            ...handlerContext,
            statusCode: response.statusCode,
            durationMs: Date.now() - startedAt,
            result: this.summarizeResult(result),
          },
          'HTTP handler completed',
        );
      }),
    );
  }

  private getHandlerContext(
    context: ExecutionContext,
    request: Request,
  ): Record<string, unknown> {
    return {
      traceId: (request as Request & { id?: unknown }).id,
      controller: context.getClass().name,
      handler: context.getHandler().name,
      method: request.method,
      url: request.originalUrl,
      params: sanitizeLogPayload(request.params),
      query: sanitizeLogPayload(request.query),
      body: sanitizeLogPayload(request.body),
    };
  }

  private summarizeResult(result: unknown): Record<string, unknown> {
    if (Array.isArray(result)) {
      return {
        type: 'array',
        items: result.length,
      };
    }

    if (typeof result === 'object' && result !== null) {
      const value = result as Record<string, unknown>;

      return {
        type: 'object',
        id: value.id,
        total: value.total,
        items: Array.isArray(value.items) ? value.items.length : undefined,
      };
    }

    return {
      type: typeof result,
    };
  }
}
