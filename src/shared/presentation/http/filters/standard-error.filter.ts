import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Request, Response } from 'express';
import { StandardErrorDto } from '../dto/standard-error.dto';

@Catch()
export class StandardErrorFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const request = context.getRequest<Request>();
    const response = context.getResponse<Response>();
    const status = this.getStatus(exception);

    const body: StandardErrorDto = {
      error: this.getErrorMessage(exception, status),
      code: this.getCode(status),
      traceId: this.getTraceId(request),
    };

    response.status(status).json(body);
  }

  private getStatus(exception: unknown): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }

    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private getErrorMessage(exception: unknown, status: number): string {
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

    return typeof traceId === 'string' && traceId.trim().length > 0
      ? traceId
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
}
