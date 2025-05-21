import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ['http://localhost:3000'], // Use array for multiple origins
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], // Added PATCH
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['*'],
  });


  const port = process.env.PORT || 8080;  // Accsessing from express side this port backend is listening on port 8080
  await app.listen(port);
  console.log(`Server is running on http://localhost:${port}`);
}


bootstrap();
