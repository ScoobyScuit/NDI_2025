import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatBrutiModule } from './defis/chat-bruti/chat-bruti.module';

@Module({
  imports: [ChatBrutiModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
