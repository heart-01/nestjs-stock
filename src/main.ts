import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './config/swagger.config';
import * as express from 'express';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  setupSwagger(app);

  app.setGlobalPrefix('api/v1');

  // Helmet middleware for setting HTTP response headers.
  app.use(helmet());

  // Cors middleware for allowing cross-origin resource sharing.
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

  // Middleware for JSON data.
  app.use(express.json({ limit: '10mb' }));

  // Middleware for URL-encoded form data.
  app.use(express.urlencoded({ limit: '10mb', extended: true }));
  
  // Middleware for serving static files.
  app.use(express.static('public'));

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
