import { Module } from '@nestjs/common';
import { ChatBrutiController } from './controller/chat-bruti.controller';
import { ChatBrutiService } from './services/chat-bruti.service';

@Module({
  controllers: [ChatBrutiController],
  providers: [ChatBrutiService],
})
export class ChatBrutiModule {}
