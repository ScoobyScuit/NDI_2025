import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SpaController } from './spa.controller';
import { ChatBrutiModule } from './defis/chat-bruti/chat-bruti.module';

@Module({
  imports: [
    ChatBrutiModule,
    // Servir les fichiers statiques du frontend Angular en production
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'frontend_ndi_2025', 'dist', 'frontend_ndi_2025', 'browser'),
      exclude: ['/api*'], // Exclure les routes API
    }),
  ],
  controllers: [AppController, SpaController],
  providers: [AppService],
})
export class AppModule {}
