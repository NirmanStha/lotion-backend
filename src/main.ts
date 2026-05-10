import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { requestIdMiddleware } from './common/logger/request-id.middleware';
import { HttpLoggingInterceptor } from './common/logger/http-logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  app.enableCors({
    origin: true,
    credentials: true,
  });
  app.use(requestIdMiddleware);
  app.useGlobalInterceptors(new HttpLoggingInterceptor());
  const swag = new DocumentBuilder()
    .setTitle('NestJS Auth API')
    .setDescription('API documentation for the NestJS authentication system')
    .setVersion('1.0')
    .addTag('auth')
    .build();

  const document = SwaggerModule.createDocument(app, swag);
  SwaggerModule.setup('docs', app, document, {
    jsonDocumentUrl: 'docs-json',
  });

  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      skipUndefinedProperties: true,
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
