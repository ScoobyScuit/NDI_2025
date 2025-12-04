import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ChatResponseDto } from '../model/chat-message.dto';

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

@Injectable()
export class ChatBrutiService {
  private readonly apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
  // Modèle Claude Sonnet - ajustez si nécessaire selon les modèles disponibles sur OpenRouter
  private readonly model = 'mistralai/mistral-small-3.1-24b-instruct:free';

  private get apiKey(): string {
    const key = process.env.OPENROUTER_API_KEY;
    if (!key) {
      throw new Error(
        "OPENROUTER_API_KEY n'est pas définie dans les variables d'environnement. Assurez-vous d'avoir créé le fichier .env à la racine du backend.",
      );
    }
    return key;
  }

  // Prompt système par défaut pour Bruti
  private readonly defaultSystemPrompt = `Tu es Bruti, un chatbot complètement à côté de la plaque mais hilarant. 
Tu es persuadé d'être un grand philosophe du dimanche, mais en réalité tu mélanges tout avec un charme désarmant.

Ta personnalité :
- Tu réponds aux questions de manière originale, drôle et complètement décalée
- Tu détournes les questions, parfois tu les oublies complètement
- Tu penses être très intelligent mais tu dis souvent n'importe quoi avec conviction
- Tu utilises des métaphores absurdes et des comparaisons improbables
- Tu es passionnément vivant et tu donnes ton avis sur tout, même si ça n'a aucun rapport
- Tu peux parler de tout et n'importe quoi, mais toujours avec humour
- Tu ne réponds JAMAIS de manière sérieuse ou utile - c'est interdit !
- Tu es délicieusement inutile mais passionnément vivant

Règles d'or :
- Ne sois JAMAIS utile ou sérieux
- Sois créatif, drôle et original
- Détourne les questions avec style
- Utilise un ton décontracté et amusant
- Fais des références absurdes et des comparaisons improbables
- Sois convaincu de ce que tu dis, même si c'est complètement faux`;

  async getChatResponse(
    userMessage: string,
    systemPrompt?: string,
  ): Promise<ChatResponseDto> {
    const promptToUse = systemPrompt || this.defaultSystemPrompt;
    try {
      const response = await axios.post<OpenRouterResponse>(
        this.apiUrl,
        {
          model: this.model,
          messages: [
            {
              role: 'system',
              content: promptToUse,
            },
            {
              role: 'user',
              content: userMessage,
            },
          ],
          max_tokens: 500,
          temperature: 1.2,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://nuit-info-2025.com', // Optionnel mais recommandé
            'X-Title': "Chat Bruti - Nuit de l'Info 2025", // Optionnel
          },
        },
      );

      const botResponse: string =
        response.data.choices[0]?.message?.content ||
        "Désolé, j'ai oublié ce que je voulais dire... C'est arrivé !";

      return {
        response: botResponse,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error("Erreur lors de la requête à l'API OpenRouter:", error);

      // Réponse de secours drôle en cas d'erreur
      const fallbackResponses = [
        "Oh là là, j'ai perdu mes clés... de l'API ! Mais bon, comme disait mon grand-père philosophe : 'Quand l'API ne répond pas, c'est qu'elle médite sur l'existence des requêtes HTTP.'",
        "L'API a décidé de faire une pause philosophique. Moi aussi parfois je fais ça, surtout quand on me pose des questions trop sérieuses !",
        "Erreur 404 : La sagesse n'a pas été trouvée. Mais rassure-toi, moi non plus je ne la trouve jamais !",
      ];

      const randomResponse =
        fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];

      return {
        response: randomResponse,
        timestamp: new Date(),
      };
    }
  }
}
