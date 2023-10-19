import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

export const setupSwagger = (app: INestApplication) => {
  const options = new DocumentBuilder()
    .setTitle('API Stock for NextJS')
    .setVersion('1.0')
    .addServer('api/v1')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'Token' },
      'authorization',
    )
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('document', app, document);
};
