import { Injectable, signal } from '@angular/core';

export type EmotionType = 'neutral' | 'happy' | 'sad' | 'angry' | 'excited' | 'sleepy' | 'confused' | 'love';

export interface Emotion {
  type: EmotionType;
  name: string;
  icon: string;
  description: string;
  animationClass: string;
  colors: {
    primary: string;
    secondary: string;
    glow: string;
    messageBg: string;
    border: string;
  };
  particles?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatEmotionService {
  private readonly emotions: Emotion[] = [
    {
      type: 'neutral',
      name: 'Neutre',
      icon: '😐',
      description: 'Calme et serein',
      animationClass: 'emotion-neutral',
      colors: {
        primary: '#4ec9b0',
        secondary: '#569cd6',
        glow: 'rgba(78, 201, 176, 0.3)',
        messageBg: 'rgba(78, 201, 176, 0.05)',
        border: '#4ec9b0'
      }
    },
    {
      type: 'happy',
      name: 'Content',
      icon: '😊',
      description: 'Super content !',
      animationClass: 'emotion-happy',
      colors: {
        primary: '#ffd700',
        secondary: '#ffed4e',
        glow: 'rgba(255, 215, 0, 0.5)',
        messageBg: 'rgba(255, 215, 0, 0.1)',
        border: '#ffd700'
      },
      particles: '✨'
    },
    {
      type: 'sad',
      name: 'Triste',
      icon: '😢',
      description: 'Un peu triste...',
      animationClass: 'emotion-sad',
      colors: {
        primary: '#6b8dd6',
        secondary: '#8fa8d4',
        glow: 'rgba(107, 141, 214, 0.3)',
        messageBg: 'rgba(107, 141, 214, 0.08)',
        border: '#6b8dd6'
      },
      particles: '💧'
    },
    {
      type: 'angry',
      name: 'Énervé',
      icon: '😠',
      description: 'Très énervé !',
      animationClass: 'emotion-angry',
      colors: {
        primary: '#ff4444',
        secondary: '#ff6666',
        glow: 'rgba(255, 68, 68, 0.6)',
        messageBg: 'rgba(255, 68, 68, 0.1)',
        border: '#ff4444'
      },
      particles: '🔥'
    },
    {
      type: 'excited',
      name: 'Excité',
      icon: '🤩',
      description: 'Super excité !',
      animationClass: 'emotion-excited',
      colors: {
        primary: '#ff6b9d',
        secondary: '#ff8fab',
        glow: 'rgba(255, 107, 157, 0.6)',
        messageBg: 'rgba(255, 107, 157, 0.12)',
        border: '#ff6b9d'
      },
      particles: '⭐'
    },
    {
      type: 'sleepy',
      name: 'Endormi',
      icon: '😴',
      description: 'Fatigué...',
      animationClass: 'emotion-sleepy',
      colors: {
        primary: '#9b9b9b',
        secondary: '#b8b8b8',
        glow: 'rgba(155, 155, 155, 0.2)',
        messageBg: 'rgba(155, 155, 155, 0.05)',
        border: '#9b9b9b'
      },
      particles: '💤'
    },
    {
      type: 'confused',
      name: 'Confus',
      icon: '🤔',
      description: 'Un peu perdu...',
      animationClass: 'emotion-confused',
      colors: {
        primary: '#ffa500',
        secondary: '#ffb84d',
        glow: 'rgba(255, 165, 0, 0.4)',
        messageBg: 'rgba(255, 165, 0, 0.08)',
        border: '#ffa500'
      },
      particles: '❓'
    },
    {
      type: 'love',
      name: 'Amoureux',
      icon: '🥰',
      description: 'Plein d\'amour !',
      animationClass: 'emotion-love',
      colors: {
        primary: '#ff69b4',
        secondary: '#ff8cc8',
        glow: 'rgba(255, 105, 180, 0.5)',
        messageBg: 'rgba(255, 105, 180, 0.1)',
        border: '#ff69b4'
      },
      particles: '💖'
    }
  ];

  currentEmotion = signal<Emotion>(this.emotions[0]);

  constructor() {}

  getEmotions(): Emotion[] {
    return this.emotions;
  }

  getEmotionByType(type: EmotionType): Emotion {
    return this.emotions.find(e => e.type === type) || this.emotions[0];
  }

  setEmotion(type: EmotionType): void {
    const emotion = this.getEmotionByType(type);
    this.currentEmotion.set(emotion);
  }

  // Détecter l'émotion basée sur le contenu du message (simple heuristique)
  detectEmotionFromMessage(message: string): EmotionType {
    const lowerMessage = message.toLowerCase();
    
    // Mots-clés pour chaque émotion
    const happyKeywords = ['super', 'génial', 'cool', 'merci', 'excellent', 'parfait', 'bravo', 'félicitations', 'joyeux', 'heureux'];
    const sadKeywords = ['triste', 'désolé', 'malheureux', 'déçu', 'déprimé', 'pleurer', 'pleure'];
    const angryKeywords = ['énervé', 'fâché', 'colère', 'furieux', 'rage', 'stupide', 'idiot', 'nul'];
    const excitedKeywords = ['wow', 'incroyable', 'fantastique', 'extraordinaire', 'impressionnant', 'ouah'];
    const sleepyKeywords = ['fatigué', 'dormir', 'sommeil', 'repos', 'épuisé'];
    const confusedKeywords = ['quoi', 'comment', 'pourquoi', 'comprends pas', 'confus', 'perdu'];
    const loveKeywords = ['amour', 'adorer', 'aimer', 'coeur', 'belle', 'beau', 'magnifique'];

    if (happyKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return 'happy';
    }
    if (sadKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return 'sad';
    }
    if (angryKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return 'angry';
    }
    if (excitedKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return 'excited';
    }
    if (sleepyKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return 'sleepy';
    }
    if (confusedKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return 'confused';
    }
    if (loveKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return 'love';
    }

    // Par défaut, émotion aléatoire pour rendre le chat plus vivant
    const randomEmotions: EmotionType[] = ['neutral', 'happy', 'excited', 'confused', 'love'];
    return randomEmotions[Math.floor(Math.random() * randomEmotions.length)];
  }

  // Changer d'émotion de manière aléatoire pour simuler un comportement humain
  randomEmotionChange(): void {
    const emotions: EmotionType[] = ['happy', 'excited', 'confused', 'neutral', 'love'];
    const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
    this.setEmotion(randomEmotion);
  }
}

