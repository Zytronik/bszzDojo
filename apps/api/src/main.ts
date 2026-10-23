import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { API_PREFIX, APP_NAME } from '@bszz-dojo/shared';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { REFRESH_COOKIE } from './auth/refresh-cookie';
import { corsOrigins } from './cors';

// Vercel deploys this file as a single function (NestJS zero-config): it must call `listen`.
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix(API_PREFIX);
  app.use(cookieParser());
  app.enableCors({ origin: corsOrigins(), credentials: true });
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );

  // Local only: on Vercel the Nest CLI's Swagger plugin doesn't run, so the docs would be empty.
  if (process.env['VERCEL'] !== '1') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle(`${APP_NAME} API`)
      .setDescription(`REST API for ${APP_NAME}`)
      .addBearerAuth()
      .addCookieAuth(REFRESH_COOKIE)
      .build();
    SwaggerModule.setup(`${API_PREFIX}/docs`, app, () =>
      SwaggerModule.createDocument(app, swaggerConfig),
    );
  }

  const port = Number(process.env['PORT'] ?? 3000);
  await app.listen(port);
  console.log(`API running on http://localhost:${port}/${API_PREFIX}`);
}

void bootstrap();
