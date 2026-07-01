import {
  ArgumentsHost,
  BadRequestException,
  HttpException,
} from '@nestjs/common';
import { AllExceptionsFilter } from './http-exception.filter';

describe('AllExceptionsFilter', () => {
  const createHost = () => {
    const response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const request = { url: '/teste' };
    const host = {
      switchToHttp: () => ({
        getResponse: () => response,
        getRequest: () => request,
      }),
    } as ArgumentsHost;

    return { host, response };
  };

  it('deve formatar HttpException com resposta em objeto', () => {
    const filter = new AllExceptionsFilter();
    const { host, response } = createHost();

    filter.catch(new BadRequestException(['campo obrigatorio']), host);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        message: ['campo obrigatorio'],
        error: 'Bad Request',
        path: '/teste',
      }),
    );
  });

  it('deve formatar HttpException com resposta em texto', () => {
    const filter = new AllExceptionsFilter();
    const { host, response } = createHost();

    filter.catch(new HttpException('falha customizada', 418), host);

    expect(response.status).toHaveBeenCalledWith(418);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 418,
        message: 'falha customizada',
        error: undefined,
        path: '/teste',
      }),
    );
  });

  it('deve formatar erro inesperado como erro interno', () => {
    const filter = new AllExceptionsFilter();
    const { host, response } = createHost();

    filter.catch(new Error('falha inesperada'), host);

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 500,
        message: 'Internal server error',
        error: undefined,
        path: '/teste',
      }),
    );
  });
});
