import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const response_ =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    const isObjectResponse = (
      value: unknown,
    ): value is { message?: unknown; error?: unknown } =>
      typeof value === 'object' && value !== null;

    const message = isObjectResponse(response_) ? response_.message : response_;
    const error = isObjectResponse(response_) ? response_.error : undefined;

    response.status(status).json({
      statusCode: status,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
