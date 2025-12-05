import { Component, input, output, signal, effect, ViewChild, ElementRef, AfterViewInit, inject, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatBrutiService } from '../../services/chat-bruti.service';
import { ChatThemeService, ChatTheme } from '../../services/chat-theme.service';
import { ChatCharacterService, ChatCharacter } from '../../services/chat-character.service';
import { ChatEmotionService, Emotion } from '../../services/chat-emotion.service';
import { ChatUserService } from '../../services/chat-user.service';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

@Component({
  selector: 'app-chat-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-modal.component.html',
  styleUrl: './chat-modal.component.css'
})
export class ChatModalComponent implements AfterViewInit {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('inputField') inputField!: ElementRef<HTMLInputElement>;

  private chatService = inject(ChatBrutiService);
  private themeService = inject(ChatThemeService);
  private characterService = inject(ChatCharacterService);
  private emotionService = inject(ChatEmotionService);
  userService = inject(ChatUserService);

  isOpen = input.required<boolean>();
  closeModal = output<void>();

  messages = signal<Message[]>([]);
  userInput = signal('');
  isLoading = signal(false);
  showThemeSelector = signal(false);
  showCharacterSelector = signal(false);
  showPseudoModal = signal(false);
  pseudoInput = signal('');
  
  currentTheme = this.themeService.currentTheme;
  themes = signal(this.themeService.getThemes());
  currentCharacter = this.characterService.currentCharacter;
  characters = signal(this.characterService.getCharacters());
  currentEmotion = this.emotionService.currentEmotion;
  userPseudo = this.userService.userPseudo;
  
  // Génération d'étoiles pour le fond
  stars = signal<Array<{ x: number; y: number; size: number; delay: number }>>([]);

  constructor() {
    // Générer les étoiles au démarrage
    this.generateStars();
    
    // Changer d'émotion de manière aléatoire toutes les 10-15 secondes
    setInterval(() => {
      if (this.isOpen()) {
        this.emotionService.randomEmotionChange();
      }
    }, 12000);

    effect(() => {
      if (this.isOpen()) {
        // Vérifier si c'est la première visite
        if (this.userService.isFirstVisit()) {
          this.showPseudoModal.set(true);
        } else {
          // Focus sur l'input quand la modal s'ouvre
          setTimeout(() => {
            this.inputField?.nativeElement?.focus();
          }, 100);
        }
        // Scroll vers le bas
        this.scrollToBottom();
      }
    });
  }

  generateStars() {
    const starsArray = [];
    for (let i = 0; i < 100; i++) {
      starsArray.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 1,
        delay: Math.random() * 3
      });
    }
    this.stars.set(starsArray);
  }

  ngAfterViewInit() {
    // Ajouter un message de bienvenue basé sur le personnage actuel
    if (this.messages().length === 0) {
      const character = this.currentCharacter();
      const welcomeMessages: { [key: string]: string } = {
        'bruti': 'Bonjour ! Je suis Bruti, votre assistant complètement à côté de la plaque mais hilarant ! Comment puis-je vous aider ?',
        'dark-vador': 'Je sens une grande perturbation dans la Force... Qui ose me déranger ?',
        'sarkozy': 'Bonjour ! Moi président, je suis là pour répondre à vos questions. C\'est ça !',
        'yoda': 'Bonjour, jeune padawan. Grande sagesse, tu cherches ?',
        'einstein': 'Bonjour. L\'imagination est plus importante que la connaissance. Comment puis-je t\'aider ?',
        'shakespeare': 'Hail, good friend! What questions dost thou have for this humble bard?',
        'pirate': 'Ahoy matey! Welcome aboard! What brings ye to me ship?'
      };
      this.messages.set([{
        role: 'assistant',
        content: welcomeMessages[character.id] || 'Bonjour ! Comment puis-je vous aider ?',
        timestamp: new Date()
      }]);
    }
  }

  sendMessage() {
    const message = this.userInput().trim();
    if (!message || this.isLoading()) return;

    // Ajouter le message de l'utilisateur
    const userMessage: Message = {
      role: 'user',
      content: message,
      timestamp: new Date()
    };
    this.messages.update(msgs => [...msgs, userMessage]);
    this.userInput.set('');
    this.isLoading.set(true);

    // Détecter l'émotion du message utilisateur
    const detectedEmotion = this.emotionService.detectEmotionFromMessage(message);
    this.emotionService.setEmotion(detectedEmotion);

    // Appel à l'API backend avec le prompt système du personnage
    const character = this.currentCharacter();
    this.chatService.sendMessage(message, character.systemPrompt).subscribe({
      next: (response) => {
        const assistantMessage: Message = {
          role: 'assistant',
          content: response.response,
          timestamp: new Date(response.timestamp)
        };
        this.messages.update(msgs => [...msgs, assistantMessage]);
        this.isLoading.set(false);
        
        // Détecter l'émotion de la réponse de l'assistant
        const responseEmotion = this.emotionService.detectEmotionFromMessage(response.response);
        setTimeout(() => {
          this.emotionService.setEmotion(responseEmotion);
        }, 500);
        
        this.scrollToBottom();
      },
      error: (error) => {
        console.error('Erreur lors de l\'envoi du message:', error);
        const errorMessage: Message = {
          role: 'assistant',
          content: 'Oups ! Il semble y avoir un problème de connexion. Vérifiez que le backend est bien démarré et que l\'API est accessible.',
          timestamp: new Date()
        };
        this.messages.update(msgs => [...msgs, errorMessage]);
        this.isLoading.set(false);
        this.scrollToBottom();
      }
    });
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  scrollToBottom() {
    setTimeout(() => {
      if (this.messagesContainer) {
        const container = this.messagesContainer.nativeElement;
        container.scrollTop = container.scrollHeight;
      }
    }, 100);
  }

  close() {
    this.closeModal.emit();
  }

  toggleThemeSelector() {
    this.showThemeSelector.update(value => !value);
  }

  selectTheme(theme: ChatTheme) {
    this.themeService.setTheme(theme.id);
    this.showThemeSelector.set(false);
  }

  toggleCharacterSelector() {
    this.showCharacterSelector.update(value => !value);
  }

  selectCharacter(character: ChatCharacter) {
    this.characterService.setCharacter(character.id);
    this.showCharacterSelector.set(false);
    // Réinitialiser les messages et afficher un nouveau message de bienvenue
    const welcomeMessages: { [key: string]: string } = {
      'bruti': 'Bonjour ! Je suis Bruti, votre assistant complètement à côté de la plaque mais hilarant ! Comment puis-je vous aider ?',
      'dark-vador': 'Je sens une grande perturbation dans la Force... Qui ose me déranger ?',
      'sarkozy': 'Bonjour ! Moi président, je suis là pour répondre à vos questions. C\'est ça !',
      'yoda': 'Bonjour, jeune padawan. Grande sagesse, tu cherches ?',
      'einstein': 'Bonjour. L\'imagination est plus importante que la connaissance. Comment puis-je t\'aider ?',
      'shakespeare': 'Hail, good friend! What questions dost thou have for this humble bard?',
      'pirate': 'Ahoy matey! Welcome aboard! What brings ye to me ship?'
    };
    this.messages.set([{
      role: 'assistant',
      content: welcomeMessages[character.id] || 'Bonjour ! Comment puis-je vous aider ?',
      timestamp: new Date()
    }]);
  }

  getThemeStyles(): { [key: string]: string } {
    const theme = this.currentTheme();
    const emotion = this.currentEmotion();
    return {
      '--bg-color': theme.colors.background,
      '--surface-color': theme.colors.surface,
      '--surface-secondary': theme.colors.surfaceSecondary,
      '--border-color': theme.colors.border,
      '--text-color': theme.colors.text,
      '--text-secondary': theme.colors.textSecondary,
      '--text-muted': theme.colors.textMuted,
      '--user-role': theme.colors.userRole,
      '--assistant-role': theme.colors.assistantRole,
      '--user-message': theme.colors.userMessage,
      '--assistant-message': theme.colors.assistantMessage,
      '--input-bg': theme.colors.inputBackground,
      '--input-border': theme.colors.inputBorder,
      '--input-text': theme.colors.inputText,
      '--button-primary': theme.colors.buttonPrimary,
      '--button-primary-hover': theme.colors.buttonPrimaryHover,
      '--button-text': theme.colors.buttonText,
      '--scrollbar-track': theme.colors.scrollbarTrack,
      '--scrollbar-thumb': theme.colors.scrollbarThumb,
      '--overlay': theme.colors.overlay,
      '--dot-red': theme.colors.dotRed,
      '--dot-yellow': theme.colors.dotYellow,
      '--dot-green': theme.colors.dotGreen,
      // Couleurs d'émotion
      '--emotion-primary': emotion.colors.primary,
      '--emotion-secondary': emotion.colors.secondary,
      '--emotion-glow': emotion.colors.glow,
      '--emotion-message-bg': emotion.colors.messageBg,
      '--emotion-border': emotion.colors.border
    };
  }

  savePseudo() {
    const pseudo = this.pseudoInput().trim();
    if (pseudo && pseudo.length >= 2) {
      this.userService.setPseudo(pseudo);
      this.showPseudoModal.set(false);
      this.pseudoInput.set('');
      // Focus sur l'input après avoir défini le pseudo
      setTimeout(() => {
        this.inputField?.nativeElement?.focus();
      }, 100);
    }
  }

  skipPseudo() {
    // Utiliser un pseudo par défaut
    this.userService.setPseudo('Utilisateur');
    this.showPseudoModal.set(false);
    this.pseudoInput.set('');
    setTimeout(() => {
      this.inputField?.nativeElement?.focus();
    }, 100);
  }

  editPseudo() {
    this.pseudoInput.set(this.userPseudo());
    this.showPseudoModal.set(true);
  }
}

