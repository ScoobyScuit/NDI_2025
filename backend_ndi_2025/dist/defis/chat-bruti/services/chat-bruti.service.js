"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatBrutiService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
let ChatBrutiService = class ChatBrutiService {
    apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
    mistralModel = 'mistralai/mistral-small-3.1-24b-instruct:free';
    claudeModel = 'anthropic/claude-sonnet-4.5';
    get apiKey() {
        const key = process.env.OPENROUTER_API_KEY;
        if (!key) {
            throw new Error("OPENROUTER_API_KEY n'est pas définie dans les variables d'environnement. Assurez-vous d'avoir créé le fichier .env à la racine du backend.");
        }
        return key;
    }
    systemPrompt = `Tu es Bruti, un chatbot français complètement à côté de la plaque mais hilarant.

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
    isRateLimitError(error) {
        if (!error.response) {
            return false;
        }
        const status = error.response.status;
        const errorData = error.response.data;
        if (status === 429) {
            return true;
        }
        const errorMessage = errorData?.error?.message || errorData?.message || '';
        const lowerMessage = errorMessage.toLowerCase();
        return (lowerMessage.includes('rate limit') ||
            lowerMessage.includes('quota') ||
            lowerMessage.includes('daily limit') ||
            lowerMessage.includes('limit exceeded') ||
            lowerMessage.includes('insufficient credits') ||
            lowerMessage.includes('billing limit'));
    }
    async makeRequest(model, userMessage) {
        const response = await axios_1.default.post(this.apiUrl, {
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
        }, {
            headers: {
                Authorization: `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://nuit-info-2025.com',
                'X-Title': "Chat Bruti - Nuit de l'Info 2025",
            },
        });
        return (response.data.choices[0]?.message?.content ||
            "Désolé, j'ai oublié ce que je voulais dire... C'est arrivé !");
    }
    async getChatResponse(userMessage) {
        try {
            console.log('Tentative avec Mistral free...');
            const botResponse = await this.makeRequest(this.mistralModel, userMessage);
            return {
                response: botResponse,
                timestamp: new Date(),
            };
        }
        catch (mistralError) {
            console.error('Erreur avec Mistral:', mistralError.response?.data || mistralError.message);
            if (this.isRateLimitError(mistralError)) {
                console.log('Limite Mistral atteinte, tentative avec Claude Sonnet 4.5...');
                try {
                    const botResponse = await this.makeRequest(this.claudeModel, userMessage);
                    return {
                        response: botResponse,
                        timestamp: new Date(),
                    };
                }
                catch (claudeError) {
                    console.error('Erreur avec Claude Sonnet 4.5:', claudeError.response?.data || claudeError.message);
                    if (this.isRateLimitError(claudeError)) {
                        return {
                            response: "Désolé, la limite journalière de requêtes a été atteinte. Les modèles Mistral (gratuit) et Claude Sonnet 4.5 ont tous les deux atteint leurs limites. Veuillez réessayer demain ou contactez l'administrateur.",
                            timestamp: new Date(),
                        };
                    }
                    return {
                        response: "Oups ! Il y a eu un problème avec les deux modèles (Mistral et Claude). L'API semble avoir des difficultés. Veuillez réessayer plus tard.",
                        timestamp: new Date(),
                    };
                }
            }
            console.log('Erreur non-limitée avec Mistral, tentative avec Claude Sonnet 4.5...');
            try {
                const botResponse = await this.makeRequest(this.claudeModel, userMessage);
                return {
                    response: botResponse,
                    timestamp: new Date(),
                };
            }
            catch (claudeError) {
                console.error('Erreur avec Claude Sonnet 4.5:', claudeError.response?.data || claudeError.message);
                if (this.isRateLimitError(claudeError)) {
                    return {
                        response: 'Désolé, la limite journalière de requêtes a été atteinte pour tous les modèles disponibles. Veuillez réessayer demain.',
                        timestamp: new Date(),
                    };
                }
                return {
                    response: "Oh là là, j'ai perdu mes clés... de l'API ! Les deux modèles (Mistral et Claude) ont rencontré des difficultés. Veuillez réessayer plus tard.",
                    timestamp: new Date(),
                };
            }
        }
    }
};
exports.ChatBrutiService = ChatBrutiService;
exports.ChatBrutiService = ChatBrutiService = __decorate([
    (0, common_1.Injectable)()
], ChatBrutiService);
//# sourceMappingURL=chat-bruti.service.js.map