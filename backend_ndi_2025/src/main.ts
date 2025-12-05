import { NestFactory } from '@nestjs/core';
import { config } from 'dotenv';
import { join } from 'path';
import * as express from 'express';
import { AppModule } from './app.module';

// Charger les variables d'environnement depuis .env
config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Activer CORS
  // En production, accepter toutes les origines
  // En développement, utiliser l'URL locale du frontend
  const isProduction = process.env.NODE_ENV === 'production';
  
  app.enableCors({
    origin: isProduction ? '*' : 'http://localhost:4200',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: !isProduction, // Désactiver credentials si origin est '*'
  });

  // Servir les fichiers statiques Angular
  const frontendPath = join(__dirname, '..', '..', 'frontend_ndi_2025', 'dist', 'frontend_ndi_2025', 'browser');
  console.log('🎯 Serving static files from:', frontendPath);
  
  app.use(express.static(frontendPath));
  
  // Fallback pour le routing Angular (SPA)
  app.use((req, res, next) => {
    // Si la requête est pour l'API, laisser passer
    if (req.path.startsWith('/api')) {
      return next();
    }
    // Sinon, servir index.html
    res.sendFile(join(frontendPath, 'index.html'));
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0'); // Écouter sur toutes les interfaces
  
  console.log(
    `🚀 Backend démarré sur le port ${port} (${isProduction ? 'production' : 'development'})`,
  );
}
bootstrap();
