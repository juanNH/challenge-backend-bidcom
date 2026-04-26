import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Request, Response } from 'express';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { RequestWithRawBody } from '../../../../app/config/http.config';
import { sanitizeLogPayload } from '../../../infrastructure/logging/log-sanitizer';
import { StandardErrorDto } from '../dto/standard-error.dto';

type BodyParserError = Error & {
  status?: number;
  statusCode?: number;
  type?: string;
  body?: string;
};

@Catch()
@Injectable()
export class StandardErrorFilter implements ExceptionFilter {
  constructor(
    @InjectPinoLogger(StandardErrorFilter.name)
    private readonly logger: PinoLogger,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const request = context.getRequest<Request>();
    const response = context.getResponse<Response>();
    const status = this.getStatus(exception);
    const rawBody = this.getRawBody(request, exception);

    const body: StandardErrorDto = {
      error: this.getErrorMessage(exception, status),
      code: this.getCode(status),
      traceId: this.getTraceId(request),
    };

    response.setHeader('x-trace-id', body.traceId);

    this.logger.error(
      {
        err: exception,
        traceId: body.traceId,
        method: request.method,
        url: request.originalUrl,
        statusCode: status,
        params: sanitizeLogPayload(request.params),
        query: sanitizeLogPayload(request.query),
        body: sanitizeLogPayload(request.body),
        rawBody,
        rawBodyLength: rawBody?.length,
        parseError: this.getParseErrorContext(exception),
      },
      'HTTP request failed',
    );

    response.status(status).json(body);
  }

  private getStatus(exception: unknown): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }

    if (this.isBodyParserError(exception)) {
      return exception.statusCode ?? exception.status ?? HttpStatus.BAD_REQUEST;
    }

    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private getErrorMessage(exception: unknown, status: number): string {
    if (this.isBodyParserError(exception)) {
      return `Invalid JSON request body: ${exception.message}`;
    }

    if (!(exception instanceof HttpException)) {
      return 'Internal server error';
    }

    const response = exception.getResponse();

    if (typeof response === 'string') {
      return response;
    }

    if (this.hasMessage(response)) {
      return Array.isArray(response.message)
        ? response.message.join('; ')
        : response.message;
    }

    if (this.hasError(response)) {
      return response.error;
    }

    return status === 500 ? 'Internal server error' : exception.message;
  }

  private getCode(status: number): string {
    return `A${status.toString().padStart(4, '0')}`;
  }

  private getTraceId(request: Request): string {
    const traceId = request.headers['x-trace-id'];
    const requestId = (request as Request & { id?: unknown }).id;

    if (typeof traceId === 'string' && traceId.trim().length > 0) {
      return traceId;
    }

    return typeof requestId === 'string' && requestId.trim().length > 0
      ? requestId
      : randomUUID();
  }

  private hasMessage(value: unknown): value is { message: string | string[] } {
    return (
      typeof value === 'object' &&
      value !== null &&
      'message' in value &&
      (typeof value.message === 'string' || Array.isArray(value.message))
    );
  }

  private hasError(value: unknown): value is { error: string } {
    return (
      typeof value === 'object' &&
      value !== null &&
      'error' in value &&
      typeof value.error === 'string'
    );
  }

  private getRawBody(request: Request, exception: unknown): string | undefined {
    const requestRawBody = (request as RequestWithRawBody).rawBody;

    if (typeof requestRawBody === 'string') {
      return this.truncate(requestRawBody);
    }

    if (
      this.isBodyParserError(exception) &&
      typeof exception.body === 'string'
    ) {
      return this.truncate(exception.body);
    }

    return undefined;
  }

  private getParseErrorContext(
    exception: unknown,
  ): Record<string, unknown> | undefined {
    if (!this.isBodyParserError(exception)) {
      return undefined;
    }

    return {
      message: exception.message,
      type: exception.type,
      statusCode: exception.statusCode ?? exception.status,
    };
  }

  private isBodyParserError(exception: unknown): exception is BodyParserError {
    return (
      typeof exception === 'object' &&
      exception !== null &&
      'message' in exception &&
      (this.hasNumberProperty(exception, 'status') ||
        this.hasNumberProperty(exception, 'statusCode')) &&
      this.isBodyParserErrorType(exception)
    );
  }

  private isBodyParserErrorType(exception: object): boolean {
    const type = 'type' in exception ? exception.type : undefined;
    const message = 'message' in exception ? exception.message : undefined;

    return (
      type === 'entity.parse.failed' ||
      (typeof message === 'string' &&
        (message.includes('JSON') || message.includes('Unexpected token')))
    );
  }

  private hasNumberProperty(
    value: object,
    property: 'status' | 'statusCode',
  ): value is Record<typeof property, number> {
    return property in value && typeof value[property] === 'number';
  }

  private truncate(value: string): string {
    const maxLength = 2_000;

    return value.length > maxLength
      ? `${value.slice(0, maxLength)}...[truncated ${value.length - maxLength} chars]`
      : value;
  }
}
