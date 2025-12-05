import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Interface pour une demande de collaboration
 */
export interface CollaborationRequest {
  id: string;
  fromName: string;
  fromEmail: string;
  toTalentId: string;
  toTalentName: string;
  toTalentEmail: string;
  message: string;
  projectType: string;
  skills: string[];
  status: 'pending' | 'accepted' | 'declined';
  createdAt: Date;
}

const STORAGE_KEY = 'collaboration_requests';

@Injectable({
  providedIn: 'root',
})
export class CollaborationService {
  private readonly _requests$ = new BehaviorSubject<CollaborationRequest[]>([]);

  constructor() {
    this.loadFromStorage();
  }

  get requests$(): Observable<CollaborationRequest[]> {
    return this._requests$.asObservable();
  }

  getRequestsSnapshot(): CollaborationRequest[] {
    return this._requests$.getValue();
  }

  /**
   * Charger les demandes depuis localStorage
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const requests = parsed.map((r: any) => ({
          ...r,
          createdAt: new Date(r.createdAt)
        }));
        this._requests$.next(requests);
        console.log('✅ Demandes de collaboration chargées:', requests.length);
      }
    } catch (error) {
      console.error('❌ Erreur chargement collaborations:', error);
    }
  }

  /**
   * Sauvegarder dans localStorage
   */
  private saveToStorage(): void {
    try {
      const requests = this._requests$.getValue();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
      console.log('💾 Demandes sauvegardées:', requests.length);
    } catch (error) {
      console.error('❌ Erreur sauvegarde:', error);
    }
  }

  /**
   * Créer une nouvelle demande de collaboration
   */
  createRequest(request: Omit<CollaborationRequest, 'id' | 'status' | 'createdAt'>): CollaborationRequest {
    const newRequest: CollaborationRequest = {
      ...request,
      id: 'collab_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      status: 'pending',
      createdAt: new Date()
    };

    const current = this._requests$.getValue();
    this._requests$.next([newRequest, ...current]);
    this.saveToStorage();

    console.log('✨ Nouvelle demande créée:', newRequest.toTalentName);
    return newRequest;
  }

  /**
   * Obtenir les demandes reçues par un talent (par email)
   */
  getRequestsForTalent(email: string): CollaborationRequest[] {
    return this._requests$.getValue().filter(r => r.toTalentEmail === email);
  }

  /**
   * Obtenir les demandes envoyées par quelqu'un
   */
  getRequestsSentBy(email: string): CollaborationRequest[] {
    return this._requests$.getValue().filter(r => r.fromEmail === email);
  }

  /**
   * Mettre à jour le statut d'une demande
   */
  updateRequestStatus(id: string, status: 'accepted' | 'declined'): void {
    const updated = this._requests$.getValue().map(r =>
      r.id === id ? { ...r, status } : r
    );
    this._requests$.next(updated);
    this.saveToStorage();
  }

  /**
   * Supprimer une demande
   */
  deleteRequest(id: string): void {
    const filtered = this._requests$.getValue().filter(r => r.id !== id);
    this._requests$.next(filtered);
    this.saveToStorage();
  }

  /**
   * Compter les demandes en attente
   */
  getPendingCount(): number {
    return this._requests$.getValue().filter(r => r.status === 'pending').length;
  }
}

