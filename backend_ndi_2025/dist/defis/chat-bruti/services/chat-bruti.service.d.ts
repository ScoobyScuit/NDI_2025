import { ChatResponseDto } from '../model/chat-message.dto';
export declare class ChatBrutiService {
    private readonly apiUrl;
    private readonly model;
    private get apiKey();
    private readonly defaultSystemPrompt;
    getChatResponse(userMessage: string, systemPrompt?: string): Promise<ChatResponseDto>;
}
