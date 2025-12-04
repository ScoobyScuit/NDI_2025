import { Injectable, signal } from '@angular/core';

export interface ChatTheme {
  id: string;
  name: string;
  icon: string;
  colors: {
    background: string;
    surface: string;
    surfaceSecondary: string;
    border: string;
    text: string;
    textSecondary: string;
    textMuted: string;
    userRole: string;
    assistantRole: string;
    userMessage: string;
    assistantMessage: string;
    inputBackground: string;
    inputBorder: string;
    inputText: string;
    buttonPrimary: string;
    buttonPrimaryHover: string;
    buttonText: string;
    scrollbarTrack: string;
    scrollbarThumb: string;
    overlay: string;
    dotRed: string;
    dotYellow: string;
    dotGreen: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ChatThemeService {
  private readonly themes: ChatTheme[] = [
    {
      id: 'terminal',
      name: 'Terminal Classique',
      icon: '💻',
      colors: {
        background: '#1e1e1e',
        surface: '#2d2d2d',
        surfaceSecondary: '#1e1e1e',
        border: '#3d3d3d',
        text: '#d4d4d4',
        textSecondary: '#e0e0e0',
        textMuted: '#6a6a6a',
        userRole: '#569cd6',
        assistantRole: '#4ec9b0',
        userMessage: '#ce9178',
        assistantMessage: '#d4d4d4',
        inputBackground: '#1e1e1e',
        inputBorder: '#3d3d3d',
        inputText: '#d4d4d4',
        buttonPrimary: '#4ec9b0',
        buttonPrimaryHover: '#3db89a',
        buttonText: '#1e1e1e',
        scrollbarTrack: '#2d2d2d',
        scrollbarThumb: '#555',
        overlay: 'rgba(0, 0, 0, 0.5)',
        dotRed: '#ff5f56',
        dotYellow: '#ffbd2e',
        dotGreen: '#27c93f'
      }
    },
    {
      id: 'modern',
      name: 'Moderne',
      icon: '✨',
      colors: {
        background: '#0f0f23',
        surface: '#1a1a3a',
        surfaceSecondary: '#0f0f23',
        border: '#2a2a4a',
        text: '#e8e8f0',
        textSecondary: '#f0f0f8',
        textMuted: '#8a8aa0',
        userRole: '#7c3aed',
        assistantRole: '#06b6d4',
        userMessage: '#f472b6',
        assistantMessage: '#e8e8f0',
        inputBackground: '#1a1a3a',
        inputBorder: '#2a2a4a',
        inputText: '#e8e8f0',
        buttonPrimary: '#7c3aed',
        buttonPrimaryHover: '#6d28d9',
        buttonText: '#ffffff',
        scrollbarTrack: '#1a1a3a',
        scrollbarThumb: '#4a4a6a',
        overlay: 'rgba(15, 15, 35, 0.7)',
        dotRed: '#ef4444',
        dotYellow: '#f59e0b',
        dotGreen: '#10b981'
      }
    },
    {
      id: 'dark',
      name: 'Sombre',
      icon: '🌙',
      colors: {
        background: '#0a0a0a',
        surface: '#1a1a1a',
        surfaceSecondary: '#0a0a0a',
        border: '#2a2a2a',
        text: '#e0e0e0',
        textSecondary: '#f0f0f0',
        textMuted: '#808080',
        userRole: '#60a5fa',
        assistantRole: '#34d399',
        userMessage: '#fbbf24',
        assistantMessage: '#e0e0e0',
        inputBackground: '#1a1a1a',
        inputBorder: '#2a2a2a',
        inputText: '#e0e0e0',
        buttonPrimary: '#34d399',
        buttonPrimaryHover: '#10b981',
        buttonText: '#0a0a0a',
        scrollbarTrack: '#1a1a1a',
        scrollbarThumb: '#404040',
        overlay: 'rgba(0, 0, 0, 0.8)',
        dotRed: '#dc2626',
        dotYellow: '#d97706',
        dotGreen: '#059669'
      }
    },
    {
      id: 'colorful',
      name: 'Coloré',
      icon: '🌈',
      colors: {
        background: '#1a0f2e',
        surface: '#2d1b4e',
        surfaceSecondary: '#1a0f2e',
        border: '#4a2d6e',
        text: '#f0e6ff',
        textSecondary: '#ffffff',
        textMuted: '#a78bfa',
        userRole: '#f472b6',
        assistantRole: '#a78bfa',
        userMessage: '#fbbf24',
        assistantMessage: '#f0e6ff',
        inputBackground: '#2d1b4e',
        inputBorder: '#4a2d6e',
        inputText: '#f0e6ff',
        buttonPrimary: '#a78bfa',
        buttonPrimaryHover: '#8b5cf6',
        buttonText: '#1a0f2e',
        scrollbarTrack: '#2d1b4e',
        scrollbarThumb: '#6d4a9e',
        overlay: 'rgba(26, 15, 46, 0.8)',
        dotRed: '#f87171',
        dotYellow: '#fbbf24',
        dotGreen: '#34d399'
      }
    },
    {
      id: 'matrix',
      name: 'Matrix',
      icon: '🟢',
      colors: {
        background: '#000000',
        surface: '#0a0a0a',
        surfaceSecondary: '#000000',
        border: '#00ff00',
        text: '#00ff00',
        textSecondary: '#00ff00',
        textMuted: '#00aa00',
        userRole: '#00ffff',
        assistantRole: '#00ff00',
        userMessage: '#ffff00',
        assistantMessage: '#00ff00',
        inputBackground: '#0a0a0a',
        inputBorder: '#00ff00',
        inputText: '#00ff00',
        buttonPrimary: '#00ff00',
        buttonPrimaryHover: '#00cc00',
        buttonText: '#000000',
        scrollbarTrack: '#0a0a0a',
        scrollbarThumb: '#00aa00',
        overlay: 'rgba(0, 0, 0, 0.9)',
        dotRed: '#ff0000',
        dotYellow: '#ffff00',
        dotGreen: '#00ff00'
      }
    },
    {
      id: 'retro',
      name: 'Rétro',
      icon: '🕹️',
      colors: {
        background: '#1a0a2e',
        surface: '#16213e',
        surfaceSecondary: '#1a0a2e',
        border: '#ff00ff',
        text: '#00ffff',
        textSecondary: '#ffff00',
        textMuted: '#ff00ff',
        userRole: '#00ffff',
        assistantRole: '#ff00ff',
        userMessage: '#ffff00',
        assistantMessage: '#00ffff',
        inputBackground: '#16213e',
        inputBorder: '#ff00ff',
        inputText: '#00ffff',
        buttonPrimary: '#ff00ff',
        buttonPrimaryHover: '#ff33ff',
        buttonText: '#000000',
        scrollbarTrack: '#16213e',
        scrollbarThumb: '#ff00ff',
        overlay: 'rgba(26, 10, 46, 0.85)',
        dotRed: '#ff0066',
        dotYellow: '#ffff00',
        dotGreen: '#00ff00'
      }
    },
    {
      id: 'cyberpunk',
      name: 'Cyberpunk',
      icon: '🤖',
      colors: {
        background: '#0d1117',
        surface: '#161b22',
        surfaceSecondary: '#0d1117',
        border: '#ff6b35',
        text: '#58a6ff',
        textSecondary: '#f0883e',
        textMuted: '#8b949e',
        userRole: '#58a6ff',
        assistantRole: '#ff6b35',
        userMessage: '#79c0ff',
        assistantMessage: '#f0883e',
        inputBackground: '#161b22',
        inputBorder: '#ff6b35',
        inputText: '#58a6ff',
        buttonPrimary: '#ff6b35',
        buttonPrimaryHover: '#ff8555',
        buttonText: '#0d1117',
        scrollbarTrack: '#161b22',
        scrollbarThumb: '#ff6b35',
        overlay: 'rgba(13, 17, 23, 0.9)',
        dotRed: '#ff0066',
        dotYellow: '#ffd700',
        dotGreen: '#00ff88'
      }
    },
    {
      id: 'pastel',
      name: 'Pastel',
      icon: '🌸',
      colors: {
        background: '#fef7f0',
        surface: '#f5e6d3',
        surfaceSecondary: '#fef7f0',
        border: '#e8c4a0',
        text: '#5a4a42',
        textSecondary: '#3d2f28',
        textMuted: '#8b7a6b',
        userRole: '#a8d5ba',
        assistantRole: '#d4a5c7',
        userMessage: '#8b7a6b',
        assistantMessage: '#5a4a42',
        inputBackground: '#f5e6d3',
        inputBorder: '#e8c4a0',
        inputText: '#5a4a42',
        buttonPrimary: '#d4a5c7',
        buttonPrimaryHover: '#c895b7',
        buttonText: '#3d2f28',
        scrollbarTrack: '#f5e6d3',
        scrollbarThumb: '#e8c4a0',
        overlay: 'rgba(254, 247, 240, 0.9)',
        dotRed: '#ffb3ba',
        dotYellow: '#ffdfba',
        dotGreen: '#baffc9'
      }
    },
    {
      id: 'nordic',
      name: 'Nordique',
      icon: '❄️',
      colors: {
        background: '#1e293b',
        surface: '#334155',
        surfaceSecondary: '#1e293b',
        border: '#475569',
        text: '#e2e8f0',
        textSecondary: '#f1f5f9',
        textMuted: '#94a3b8',
        userRole: '#60a5fa',
        assistantRole: '#38bdf8',
        userMessage: '#93c5fd',
        assistantMessage: '#e2e8f0',
        inputBackground: '#334155',
        inputBorder: '#475569',
        inputText: '#e2e8f0',
        buttonPrimary: '#38bdf8',
        buttonPrimaryHover: '#22d3ee',
        buttonText: '#1e293b',
        scrollbarTrack: '#334155',
        scrollbarThumb: '#475569',
        overlay: 'rgba(30, 41, 59, 0.85)',
        dotRed: '#ef4444',
        dotYellow: '#fbbf24',
        dotGreen: '#10b981'
      }
    },
    {
      id: 'sunset',
      name: 'Coucher de Soleil',
      icon: '🌅',
      colors: {
        background: '#1a1a2e',
        surface: '#16213e',
        surfaceSecondary: '#1a1a2e',
        border: '#e94560',
        text: '#f5a097',
        textSecondary: '#ffd3a5',
        textMuted: '#c9a8a0',
        userRole: '#ffd3a5',
        assistantRole: '#e94560',
        userMessage: '#ffd3a5',
        assistantMessage: '#f5a097',
        inputBackground: '#16213e',
        inputBorder: '#e94560',
        inputText: '#f5a097',
        buttonPrimary: '#e94560',
        buttonPrimaryHover: '#f15b75',
        buttonText: '#ffffff',
        scrollbarTrack: '#16213e',
        scrollbarThumb: '#e94560',
        overlay: 'rgba(26, 26, 46, 0.85)',
        dotRed: '#e94560',
        dotYellow: '#ffd3a5',
        dotGreen: '#a8e6cf'
      }
    },
    {
      id: 'ocean',
      name: 'Océan',
      icon: '🌊',
      colors: {
        background: '#0a1929',
        surface: '#132f4c',
        surfaceSecondary: '#0a1929',
        border: '#1976d2',
        text: '#90caf9',
        textSecondary: '#bbdefb',
        textMuted: '#64b5f6',
        userRole: '#42a5f5',
        assistantRole: '#29b6f6',
        userMessage: '#90caf9',
        assistantMessage: '#bbdefb',
        inputBackground: '#132f4c',
        inputBorder: '#1976d2',
        inputText: '#90caf9',
        buttonPrimary: '#29b6f6',
        buttonPrimaryHover: '#4fc3f7',
        buttonText: '#0a1929',
        scrollbarTrack: '#132f4c',
        scrollbarThumb: '#1976d2',
        overlay: 'rgba(10, 25, 41, 0.85)',
        dotRed: '#ef5350',
        dotYellow: '#ffb74d',
        dotGreen: '#66bb6a'
      }
    },
    {
      id: 'forest',
      name: 'Forêt',
      icon: '🌲',
      colors: {
        background: '#1b2f1b',
        surface: '#2d4a2d',
        surfaceSecondary: '#1b2f1b',
        border: '#4a7c4a',
        text: '#a8d5a8',
        textSecondary: '#c8e6c8',
        textMuted: '#7aa87a',
        userRole: '#81c784',
        assistantRole: '#66bb6a',
        userMessage: '#a8d5a8',
        assistantMessage: '#c8e6c8',
        inputBackground: '#2d4a2d',
        inputBorder: '#4a7c4a',
        inputText: '#a8d5a8',
        buttonPrimary: '#66bb6a',
        buttonPrimaryHover: '#81c784',
        buttonText: '#1b2f1b',
        scrollbarTrack: '#2d4a2d',
        scrollbarThumb: '#4a7c4a',
        overlay: 'rgba(27, 47, 27, 0.85)',
        dotRed: '#e57373',
        dotYellow: '#ffb74d',
        dotGreen: '#66bb6a'
      }
    }
  ];

  currentTheme = signal<ChatTheme>(this.themes[0]);

  constructor() {
    // Charger le thème sauvegardé depuis localStorage
    const savedTheme = localStorage.getItem('chat-theme');
    if (savedTheme) {
      const theme = this.themes.find(t => t.id === savedTheme);
      if (theme) {
        this.currentTheme.set(theme);
      }
    }
  }

  getThemes(): ChatTheme[] {
    return this.themes;
  }

  setTheme(themeId: string): void {
    const theme = this.themes.find(t => t.id === themeId);
    if (theme) {
      this.currentTheme.set(theme);
      localStorage.setItem('chat-theme', themeId);
    }
  }

  getCurrentTheme(): ChatTheme {
    return this.currentTheme();
  }
}

