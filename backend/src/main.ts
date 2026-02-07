import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  
  // Use structured logger
  app.useLogger(app.get(Logger));

  // Validation
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Engram API')
    .setDescription('The On-Chain Memory Terminal API')
    .setVersion('1.0')
    .addTag('Engram')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
