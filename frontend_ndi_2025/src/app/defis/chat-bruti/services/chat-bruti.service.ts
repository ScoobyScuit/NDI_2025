import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ChatMessageRequest {
  message: string;
  systemPrompt?: string;
}

export interface ChatMessageResponse {
  response: string;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ChatBrutiService {
  private readonly apiUrl = 'http://localhost:3000/chat-bruti';

  constructor(private http: HttpClient) {}

  sendMessage(message: string, systemPrompt?: string): Observable<ChatMessageResponse> {
    const body: ChatMessageRequest = { message, systemPrompt };
    return this.http.post<ChatMessageResponse>(`${this.apiUrl}/message`, body);
  }
}

