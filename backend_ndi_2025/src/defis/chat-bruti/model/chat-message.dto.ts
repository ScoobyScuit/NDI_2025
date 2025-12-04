export class ChatMessageDto {
  message: string;
  systemPrompt?: string;
}

export class ChatResponseDto {
  response: string;
  timestamp: Date;
}
