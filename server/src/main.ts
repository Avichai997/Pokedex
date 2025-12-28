import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { doubleCsrf } from 'csrf-csrf';

import { AppModule } from '@/app.module';
import { HttpExceptionFilter } from '@/common';
import { config } from '@/config';
import { setupSwagger } from '@/utils';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security middleware
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
      crossOriginEmbedderPolicy: false,
    }),
  );
  app.use(cookieParser());

  const { doubleCsrfProtection } = doubleCsrf({
    getSecret: () => config.jwt.secret,
    getSessionIdentifier: (req) => req.ip || 'default',
    cookieName: '_csrf',
    cookieOptions: {
      httpOnly: true,
      secure: config.server.nodeEnv === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
    size: 64,
    ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
    getCsrfTokenFromRequest: (req) =>
      (req.headers['x-csrf-token'] || req.headers['X-CSRF-Token']) as string,
    skipCsrfProtection: (req) => {
      // Skip CSRF check for auth endpoints (login, register, csrf-token)
      const path = req.path;
      return (
        path.startsWith('/api/auth/login') ||
        path.startsWith('/api/auth/register') ||
        path.startsWith('/api/auth/csrf-token')
      );
    },
  });

  app.use(doubleCsrfProtection);

  // CORS configuration
  app.enableCors({
    origin: config.cors.clientUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // API prefix
  app.setGlobalPrefix('api');

  setupSwagger(app);

  const port = config.server.port;
  await app.listen(port);
  console.log(`Server is running on: http://localhost:${port}`);
  console.log(`Swagger documentation available at: http://localhost:${port}/api/docs`);
}

bootstrap();
