import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Contratos em docs/arquitetura/03: prefixo /v1, erros RFC 9457,
  // paginação por cursor, auth Bearer.
  app.setGlobalPrefix('v1');
  app.enableShutdownHooks();
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
