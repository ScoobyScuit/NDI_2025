import { Controller, Post, Body, Get } from '@nestjs/common';
import { ChatBrutiService } from '../services/chat-bruti.service';
import { ChatMessageDto, ChatResponseDto } from '../model/chat-message.dto';

@Controller('chat-bruti')
export class ChatBrutiController {
  constructor(private readonly chatBrutiService: ChatBrutiService) {}

  @Post('message')
  async sendMessage(
    @Body() chatMessageDto: ChatMessageDto,
  ): Promise<ChatResponseDto> {
    return await this.chatBrutiService.getChatResponse(chatMessageDto.message);
  }

  @Get()
  getInfo(): { name: string; description: string } {
    return {
      name: 'Bruti',
      description:
        "Un chatbot complètement à côté de la plaque mais hilarant, persuadé d'être un philosophe du dimanche !",
    };
  }
}
