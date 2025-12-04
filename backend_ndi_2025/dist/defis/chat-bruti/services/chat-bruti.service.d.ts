import { ChatResponseDto } from '../model/chat-message.dto';
export declare class ChatBrutiService {
    private readonly apiUrl;
    private readonly mistralModel;
    private readonly claudeModel;
    private get apiKey();
    private readonly systemPrompt;
    private isRateLimitError;
    private makeRequest;
    getChatResponse(userMessage: string): Promise<ChatResponseDto>;
}
