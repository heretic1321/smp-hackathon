import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './core/filters/global-exception.filter';
import { RequestIdInterceptor } from './core/interceptors/request-id.interceptor';
import { ResponseFormatterInterceptor } from './core/interceptors/response-formatter.interceptor';
import { EnvironmentConfig } from './core/config/env.validation';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Get configuration service
  const configService = app.get(ConfigService<EnvironmentConfig>);

  // Global prefix removed - using versioning instead
  // app.setGlobalPrefix('v1');

  // API versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Cookie parser middleware - MUST come before routes
  app.use(cookieParser());

  // Security: Helmet
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    crossOriginEmbedderPolicy: false, // Allow Unity WebGL
  }));

  // CORS configuration for subdomain support
  app.enableCors({
    origin: [
      `https://app.${configService.get('DOMAIN')}`,
      `https://play.${configService.get('DOMAIN')}`,
      // Allow localhost for development
      /^https?:\/\/localhost(:\d+)?$/,
      /^https?:\/\/127\.0\.0\.1(:\d+)?$/,
      /^https?:\/\/.*\.lvh\.me(:\d+)?$/,
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'X-Request-Id',
      'Idempotency-Key',
      'X-Service-Key',
      'Cookie',
    ],
    exposedHeaders: ['Set-Cookie'],
  });

  // Note: We use per-route validation pipes in controllers instead of a global one

  // Global interceptors
  app.useGlobalInterceptors(
    new RequestIdInterceptor(),
    new ResponseFormatterInterceptor(),
  );

  // Global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Start the server
  const port = configService.get('PORT', 4000);
  await app.listen(port);

  console.log(`🚀 Shadow Monarch's Path Core API is running on port ${port}`);
  console.log(`📖 Environment: ${configService.get('NODE_ENV')}`);
  console.log(`🌐 Domain: ${configService.get('DOMAIN')}`);
  console.log(`🔗 Health check: http://localhost:${port}/v1/health`);
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start application:', error);
  process.exit(1);
});
