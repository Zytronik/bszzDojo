import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { API_PREFIX } from '@bszz-dojo/shared';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { validationException } from './common/validation-errors';
import { setupSwagger } from './swagger';

// Vercel deploys this file as a single function (NestJS zero-config): it must call `listen`.
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix(API_PREFIX);
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: validationException,
    }),
  );
  await setupSwagger(app);

  const port = Number(process.env['PORT'] ?? 3000);
  await app.listen(port);
  console.log(`API running on http://localhost:${port}/${API_PREFIX} (Swagger UI)`);
}

void bootstrap();
