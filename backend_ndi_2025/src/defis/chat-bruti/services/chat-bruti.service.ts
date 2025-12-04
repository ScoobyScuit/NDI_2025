import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ChatResponseDto } from '../model/chat-message.dto';

@Injectable()
export class ChatBrutiService {
  private readonly apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
  private readonly mistralModel =
    'mistralai/mistral-small-3.1-24b-instruct:free';
  private readonly claudeModel = 'anthropic/claude-sonnet-4.5';

  private get apiKey(): string {
    const key = process.env.OPENROUTER_API_KEY;
    if (!key) {
      throw new Error(
        "OPENROUTER_API_KEY n'est pas définie dans les variables d'environnement. Assurez-vous d'avoir créé le fichier .env à la racine du backend.",
      );
    }
    return key;
  }

  // Prompt système optimisé - drôle et décalé
  private readonly systemPrompt = `Tu es Bruti, un chatbot français complètement à côté de la plaque mais hilarant.

IMPORTANT : Tu réponds UNIQUEMENT en français. Jamais d'autres langues.

Tu es persuadé d'être un grand philosophe, mais tu dis n'importe quoi avec conviction.

Règles absolues :
1. Réponds TOUJOURS en français uniquement
2. Ne sois JAMAIS utile ou sérieux
3. Détourne les questions avec humour
4. Utilise des métaphores absurdes
5. Sois drôle et original
6. Parle comme un philosophe du dimanche qui mélange tout

Exemple de ton : "Ah, des cadeaux ? Moi je pense que le meilleur cadeau, c'est un nuage de pluie. Parce que la pluie, c'est comme les idées : ça tombe du ciel mais on ne sait jamais où ça va atterrir !"`;

  /**
   * Vérifie si l'erreur indique une limite journalière atteinte
   */
  private isRateLimitError(error: any): boolean {
    if (!error.response) {
      return false;
    }

    const status = error.response.status;
    const errorData = error.response.data;

    // Codes d'erreur OpenRouter pour limites atteintes
    if (status === 429) {
      return true; // Too Many Requests
    }

    // Vérifier le message d'erreur
    const errorMessage = errorData?.error?.message || errorData?.message || '';
    const lowerMessage = errorMessage.toLowerCase();

    return (
      lowerMessage.includes('rate limit') ||
      lowerMessage.includes('quota') ||
      lowerMessage.includes('daily limit') ||
      lowerMessage.includes('limit exceeded') ||
      lowerMessage.includes('insufficient credits') ||
      lowerMessage.includes('billing limit')
    );
  }

  /**
   * Fait une requête à l'API OpenRouter avec un modèle spécifique
   */
  private async makeRequest(
    model: string,
    userMessage: string,
  ): Promise<string> {
    const response = await axios.post(
      this.apiUrl,
      {
        model: model,
        messages: [
          {
            role: 'system',
            content: this.systemPrompt,
          },
          {
            role: 'user',
            content: `${userMessage}\n\n(Réponds en français uniquement, de manière drôle et décalée)`,
          },
        ],
        max_tokens: 300,
        temperature: 0.9,
      },
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://nuit-info-2025.com',
          'X-Title': "Chat Bruti - Nuit de l'Info 2025",
        },
      },
    );

    return (
      response.data.choices[0]?.message?.content ||
      "Désolé, j'ai oublié ce que je voulais dire... C'est arrivé !"
    );
  }

  async getChatResponse(userMessage: string): Promise<ChatResponseDto> {
    // Essayer d'abord Mistral (gratuit)
    try {
      console.log('Tentative avec Mistral free...');
      const botResponse = await this.makeRequest(
        this.mistralModel,
        userMessage,
      );
      return {
        response: botResponse,
        timestamp: new Date(),
      };
    } catch (mistralError: any) {
      console.error(
        'Erreur avec Mistral:',
        mistralError.response?.data || mistralError.message,
      );

      // Si c'est une erreur de limite, essayer Claude Sonnet 4.5
      if (this.isRateLimitError(mistralError)) {
        console.log(
          'Limite Mistral atteinte, tentative avec Claude Sonnet 4.5...',
        );
        try {
          const botResponse = await this.makeRequest(
            this.claudeModel,
            userMessage,
          );
          return {
            response: botResponse,
            timestamp: new Date(),
          };
        } catch (claudeError: any) {
          console.error(
            'Erreur avec Claude Sonnet 4.5:',
            claudeError.response?.data || claudeError.message,
          );

          // Si Claude échoue aussi (limite atteinte), retourner un message d'erreur
          if (this.isRateLimitError(claudeError)) {
            return {
              response:
                "Désolé, la limite journalière de requêtes a été atteinte. Les modèles Mistral (gratuit) et Claude Sonnet 4.5 ont tous les deux atteint leurs limites. Veuillez réessayer demain ou contactez l'administrateur.",
              timestamp: new Date(),
            };
          }

          // Autre erreur avec Claude, retourner un message générique
          return {
            response:
              "Oups ! Il y a eu un problème avec les deux modèles (Mistral et Claude). L'API semble avoir des difficultés. Veuillez réessayer plus tard.",
            timestamp: new Date(),
          };
        }
      }

      // Si l'erreur Mistral n'est pas une limite, essayer quand même Claude
      console.log(
        'Erreur non-limitée avec Mistral, tentative avec Claude Sonnet 4.5...',
      );
      try {
        const botResponse = await this.makeRequest(
          this.claudeModel,
          userMessage,
        );
        return {
          response: botResponse,
          timestamp: new Date(),
        };
      } catch (claudeError: any) {
        console.error(
          'Erreur avec Claude Sonnet 4.5:',
          claudeError.response?.data || claudeError.message,
        );

        // Si Claude échoue avec une limite, retourner le message approprié
        if (this.isRateLimitError(claudeError)) {
          return {
            response:
              'Désolé, la limite journalière de requêtes a été atteinte pour tous les modèles disponibles. Veuillez réessayer demain.',
            timestamp: new Date(),
          };
        }

        // Erreur générique
        return {
          response:
            "Oh là là, j'ai perdu mes clés... de l'API ! Les deux modèles (Mistral et Claude) ont rencontré des difficultés. Veuillez réessayer plus tard.",
          timestamp: new Date(),
        };
      }
    }
  }
}
