import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './config/swagger.config';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  setupSwagger(app);

  app.setGlobalPrefix('api/v1');

  app.enableCors({
    origin: ['http://localhost:3000'],
    methods: 'GET,PATCH,POST,DELETE',
    credentials: true,
    allowedHeaders: 'Content-Type, Authorization',
    exposedHeaders: 'Authorization',
    maxAge: 3600,
    optionsSuccessStatus: 204,
    preflightContinue: false,
  });
  app.use(express.json({ limit: '10mb' }));

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
