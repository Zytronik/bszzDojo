import { HttpStatus, RequestMethod, type INestApplication } from '@nestjs/common';
import { HTTP_CODE_METADATA, METHOD_METADATA } from '@nestjs/common/constants';
import {
  ApiResponse,
  DocumentBuilder,
  SwaggerModule,
  type ApiResponseOptions,
  type SwaggerCustomOptions,
} from '@nestjs/swagger';
import { API_PREFIX, APP_NAME, APP_VERSION, isRecord } from '@bszz-dojo/shared';
import { REFRESH_COOKIE } from './auth/refresh-cookie';
import metadata from './metadata';

/** Major version of the installed `swagger-ui-dist` */
const SWAGGER_UI_MAJOR = 5;

/**
 * On Vercel the UI's assets come from a CDN: the function bundle isn't guaranteed to contain
 * `swagger-ui-dist`'s files, which Nest otherwise serves from disk.
 */
function cdnAssets(): SwaggerCustomOptions {
  const base = `https://cdn.jsdelivr.net/npm/swagger-ui-dist@${SWAGGER_UI_MAJOR}`;
  return {
    customCssUrl: `${base}/swagger-ui.css`,
    customJs: [`${base}/swagger-ui-bundle.js`, `${base}/swagger-ui-standalone-preset.js`],
  };
}

function successStatus(handler: object): number {
  const status: unknown = Reflect.getMetadata(HTTP_CODE_METADATA, handler);
  if (typeof status === 'number') return status;
  const method: unknown = Reflect.getMetadata(METHOD_METADATA, handler);
  return method === RequestMethod.POST ? HttpStatus.CREATED : HttpStatus.OK;
}

/**
 * Adds each route's success response from the plugin metadata. Nest only does that for routes
 * without any other response decorator, so routes with e.g. `@ApiUnauthorizedResponse()` would
 * lose their response type whenever the docs come from `metadata.ts` instead of `nest build`.
 */
async function addSuccessResponses(): Promise<void> {
  const loaded: unknown = await metadata();
  const swagger = isRecord(loaded) ? loaded['@nestjs/swagger'] : undefined;
  const controllers: unknown = isRecord(swagger) ? swagger['controllers'] : undefined;
  if (!Array.isArray(controllers)) return;

  for (const entry of controllers) {
    if (!Array.isArray(entry)) continue;
    const [modulePromise, classes]: unknown[] = entry;
    const exports: unknown = await modulePromise;
    if (!isRecord(exports) || !isRecord(classes)) continue;

    for (const [className, methods] of Object.entries(classes)) {
      const controller = exports[className];
      if (typeof controller !== 'function' || !isRecord(methods)) continue;
      const prototype: unknown = controller.prototype;
      if (!isRecord(prototype)) continue;

      for (const [methodName, methodMeta] of Object.entries(methods)) {
        const descriptor = Object.getOwnPropertyDescriptor(prototype, methodName);
        const handler: unknown = descriptor?.value;
        if (!descriptor || typeof handler !== 'function' || !isRecord(methodMeta)) continue;
        if (methodMeta['type'] === undefined) continue;
        const response = {
          status: successStatus(handler),
          type: methodMeta['type'],
        } as ApiResponseOptions;
        // Merges with the existing responses instead of skipping them.
        ApiResponse(response, { overrideExisting: true })(prototype, methodName, descriptor);
      }
    }
  }
}

export async function setupSwagger(app: INestApplication): Promise<void> {
  await SwaggerModule.loadPluginMetadata(metadata);
  await addSuccessResponses();

  const config = new DocumentBuilder()
    .setTitle(`${APP_NAME} API`)
    .setDescription(`REST API for ${APP_NAME}`)
    .setVersion(APP_VERSION)
    .addBearerAuth()
    .addCookieAuth(REFRESH_COOKIE)
    .build();
  SwaggerModule.setup(API_PREFIX, app, () => SwaggerModule.createDocument(app, config), {
    customSiteTitle: `${APP_NAME} API`,
    ...(process.env['VERCEL'] === '1' ? cdnAssets() : {}),
  });
}
