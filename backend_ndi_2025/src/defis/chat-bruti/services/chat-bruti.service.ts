import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ChatResponseDto } from '../model/chat-message.dto';

@Injectable()
export class ChatBrutiService {
  private readonly apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
  // Modèle Claude Sonnet par défaut- ajustez si nécessaire selon les modèles disponibles sur OpenRouter
  private readonly model = 'mistralai/mistral-small-3.1-24b-instruct:free';

  private get apiKey(): string {
    const key = process.env.OPENROUTER_API_KEY;
    if (!key) {
      throw new Error(
        'OPENROUTER_API_KEY n\'est pas définie dans les variables d\'environnement. Assurez-vous d\'avoir créé le fichier .env à la racine du backend.',
      );
    }
    return key;
  }

  // Prompt système optimisé pour Mistral - drôle et décalé
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

  async getChatResponse(userMessage: string): Promise<ChatResponseDto> {
    try {
      const response = await axios.post(
        this.apiUrl,
        {
          model: this.model,
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
          temperature: 0.9, // Température réduite pour plus de cohérence avec Mistral
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://nuit-info-2025.com', // Optionnel mais recommandé
            'X-Title': 'Chat Bruti - Nuit de l\'Info 2025', // Optionnel
          },
        },
      );

      const botResponse =
        response.data.choices[0]?.message?.content ||
        "Désolé, j'ai oublié ce que je voulais dire... C'est arrivé !";

      return {
        response: botResponse,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('Erreur lors de la requête à l\'API OpenRouter:', error);
      
      // Réponse de secours drôle en cas d'erreur
      const fallbackResponses = [
        "Oh là là, j'ai perdu mes clés... de l'API ! Mais bon, comme disait mon grand-père philosophe : 'Quand l'API ne répond pas, c'est qu'elle médite sur l'existence des requêtes HTTP.'",
        "L'API a décidé de faire une pause philosophique. Moi aussi parfois je fais ça, surtout quand on me pose des questions trop sérieuses !",
        "Erreur 404 : La sagesse n'a pas été trouvée. Mais rassure-toi, moi non plus je ne la trouve jamais !",
      ];
      
      const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      
      return {
        response: randomResponse,
        timestamp: new Date(),
      };
    }
  }
}

