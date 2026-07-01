import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import yaml from 'js-yaml';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

function loadOpenApiDocument(
  app: Awaited<ReturnType<typeof NestFactory.create>>,
) {
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Gerenciador de Alunos API')
    .setDescription(
      'API REST para gerenciamento de cursos, alunos, disciplinas e matriculas.',
    )
    .setVersion('1.0.0')
    .build();

  const openApiPaths = [
    join(process.cwd(), '..', '..', 'docs', 'openapi.yaml'),
    join(process.cwd(), 'docs', 'openapi.yaml'),
  ];
  const openApiPath = openApiPaths.find((path) => existsSync(path));

  if (!openApiPath) {
    return SwaggerModule.createDocument(app, swaggerConfig);
  }

  return yaml.load(readFileSync(openApiPath, 'utf8')) as OpenAPIObject;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const corsOrigin = process.env.CORS_ORIGIN;
  app.enableCors({
    origin: corsOrigin ? corsOrigin.split(',') : true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  const swaggerDocument = loadOpenApiDocument(app);
  SwaggerModule.setup('api-docs', app, swaggerDocument, {
    jsonDocumentUrl: 'api-docs-json',
  });

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
