import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { TraceContextService } from '../../../infrastructure/trace/trace-context.service';

type RequestWithId = Request & {
  id?: unknown;
};

@Injectable()
export class TraceContextInterceptor implements NestInterceptor {
  constructor(private readonly traceContextService: TraceContextService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const http = context.switchToHttp();
    const request = http.getRequest<RequestWithId>();
    const response = http.getResponse<Response>();
    const traceId = this.resolveTraceId(request);

    request.id = traceId;
    response.setHeader('x-trace-id', traceId);

    return new Observable((subscriber) =>
      this.traceContextService.run(traceId, () => {
        const subscription = next.handle().subscribe({
          next: (value) => subscriber.next(value),
          error: (error) => subscriber.error(error),
          complete: () => subscriber.complete(),
        });

        return () => subscription.unsubscribe();
      }),
    );
  }

  private resolveTraceId(request: RequestWithId): string {
    const headerTraceId = request.headers['x-trace-id'];

    if (typeof headerTraceId === 'string' && headerTraceId.trim().length > 0) {
      return headerTraceId;
    }

    if (typeof request.id === 'string' && request.id.trim().length > 0) {
      return request.id;
    }

    return randomUUID();
  }
}
