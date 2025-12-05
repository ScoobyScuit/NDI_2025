import { NestFactory } from '@nestjs/core';
import { config } from 'dotenv';
import { resolve } from 'path';
import { AppModule } from './app.module';

// Charger les variables d'environnement depuis .env
// Utiliser le chemin absolu depuis le répertoire de travail actuel
config({ path: resolve(process.cwd(), '.env') });

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Activer CORS pour permettre les requêtes depuis le frontend
  app.enableCors({
    origin: 'http://localhost:4200', // URL du frontend Angular
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
  console.log(
    `🚀 Backend démarré sur http://localhost:${process.env.PORT ?? 3000}`,
  );
}
bootstrap();
