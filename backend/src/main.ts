import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as compression from 'compression';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: ['error', 'warn', 'log'] });
  const config = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // ── Security ──────────────────────────────────────────────────────────────
  app.use(helmet());
  app.use(compression());
  // 개발환경에서는 모든 origin 허용 (Expo Go 실기기 포함)
  const allowedOrigins = config.get('NODE_ENV') === 'production'
    ? config.get('ALLOWED_ORIGINS', '*').split(',')
    : true;
  app.enableCors({ origin: allowedOrigins, credentials: true });

  // ── Global pipes ──────────────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,  // DTO 외 필드는 무시 (에러 내지 않음)
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ── API prefix ────────────────────────────────────────────────────────────
  app.setGlobalPrefix('api/v1');

  // ── Swagger ───────────────────────────────────────────────────────────────
  if (config.get('NODE_ENV') !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('오늘의가족 API')
      .setDescription('Today\'s Family — Private family sharing app API')
      .setVersion('1.0')
      .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'JWT')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
    logger.log('Swagger UI → http://localhost:3000/docs');
  }

  const port = config.get<number>('PORT', 3000);
  await app.listen(port);
  logger.log(`🚀 Server running on port ${port}`);
}

bootstrap();
