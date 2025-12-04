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

