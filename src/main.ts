import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { ValidationPipe } from '@nestjs/common';
import { useContainer } from 'class-validator';
import { ConfigService } from '@nestjs/config';
import { VersioningType } from '@nestjs/common';
import { AllConfigType } from './config/config.type';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { parse as qsParse } from 'qs';

async function bootstrap() {
  initializeTransactionalContext();

  const app = await NestFactory.create(AppModule);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const expressApp = app.getHttpAdapter().getInstance();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  expressApp.set('query parser', (str: string) =>
    qsParse(str, {
      depth: 10,
      arrayLimit: 100,
      parseArrays: true,
      allowDots: false,
    }),
  );

  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const configService = app.get(ConfigService<AllConfigType>);

  app.enableShutdownHooks();
  app.setGlobalPrefix(
    configService.getOrThrow('app.apiPrefix', { infer: true }),
    {
      exclude: ['/'],
    },
  );
  app.enableVersioning({
    type: VersioningType.URI,
  });

  const corsOrigin = configService.getOrThrow('app.corsOrigin', {
    infer: true,
  });

  app.enableCors({
    origin: corsOrigin.split(','),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders:
      'Content-Type,Authorization,Accept,Origin,X-Requested-With,Cookie,Set-Cookie',
    exposedHeaders: 'Authorization,Set-Cookie',
    credentials: true,
  });

  // security
  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: {
        directives: {
          imgSrc: [`'self'`, 'data:'],
          scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
          manifestSrc: [`'self'`],
          frameSrc: [`'self'`],
        },
      },
      xXssProtection: true,
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
      noSniff: true,
    }),
  );

  // Configure cookie parser
  app.use(cookieParser());

  // documentation
  const options = new DocumentBuilder()
    .setTitle(configService.getOrThrow('app.name', { infer: true }))
    .setDescription(
      configService.getOrThrow('app.description', { infer: true }),
    )
    .setVersion(configService.getOrThrow('app.version', { infer: true }))
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('docs', app, document);

  await app.listen(configService.getOrThrow('app.port', { infer: true }));
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
