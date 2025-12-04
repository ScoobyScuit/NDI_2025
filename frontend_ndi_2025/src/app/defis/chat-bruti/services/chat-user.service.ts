import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ChatUserService {
  private readonly STORAGE_KEY = 'chat-user-pseudo';
  private readonly FIRST_VISIT_KEY = 'chat-first-visit';

  userPseudo = signal<string>('');

  constructor() {
    // Charger le pseudo depuis localStorage
    const savedPseudo = localStorage.getItem(this.STORAGE_KEY);
    if (savedPseudo) {
      this.userPseudo.set(savedPseudo);
    }
  }

  isFirstVisit(): boolean {
    return !localStorage.getItem(this.FIRST_VISIT_KEY);
  }

  setPseudo(pseudo: string): void {
    if (pseudo && pseudo.trim()) {
      const trimmedPseudo = pseudo.trim();
      this.userPseudo.set(trimmedPseudo);
      localStorage.setItem(this.STORAGE_KEY, trimmedPseudo);
      localStorage.setItem(this.FIRST_VISIT_KEY, 'false');
    }
  }

  getPseudo(): string {
    return this.userPseudo() || 'Utilisateur';
  }

  hasPseudo(): boolean {
    return !!this.userPseudo();
  }

  clearPseudo(): void {
    this.userPseudo.set('');
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.FIRST_VISIT_KEY);
  }
}

