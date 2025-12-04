import { ChatBrutiService } from '../services/chat-bruti.service';
import { ChatMessageDto, ChatResponseDto } from '../model/chat-message.dto';
export declare class ChatBrutiController {
    private readonly chatBrutiService;
    constructor(chatBrutiService: ChatBrutiService);
    sendMessage(chatMessageDto: ChatMessageDto): Promise<ChatResponseDto>;
    getInfo(): {
        name: string;
        description: string;
    };
}
