// card.component.ts - With Modal Detail View & Contact
import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  ViewChild,
  HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Talent } from '../../../services/talent.service';
import { CollaborationService, CollaborationRequest } from '../../../services/collaboration.service';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './card.html',
  styleUrls: ['./card.css']
})
export class Card implements AfterViewInit, OnDestroy {
  @Input({ required: true }) talent!: Talent;
  @Input() colorIndex: number = 0;
  @ViewChild('cardEl') cardEl!: ElementRef<HTMLElement>;

  // Color themes for cards
  readonly colorThemes = [
    { bg: 'linear-gradient(160deg, #F5D547 0%, #E8C84A 50%, #F5D547 100%)', color1: '#F5D547', color2: '#E8C84A', accent: '#1a1a1a' }, // Yellow
    { bg: 'linear-gradient(160deg, #3DB4AD 0%, #2A9D8F 50%, #3DB4AD 100%)', color1: '#3DB4AD', color2: '#2A9D8F', accent: '#fff' }, // Teal
    { bg: 'linear-gradient(160deg, #FF6B6B 0%, #EE5A5A 50%, #FF6B6B 100%)', color1: '#FF6B6B', color2: '#EE5A5A', accent: '#fff' }, // Coral
    { bg: 'linear-gradient(160deg, #A78BFA 0%, #8B5CF6 50%, #A78BFA 100%)', color1: '#A78BFA', color2: '#8B5CF6', accent: '#fff' }, // Purple
    { bg: 'linear-gradient(160deg, #4ADE80 0%, #22C55E 50%, #4ADE80 100%)', color1: '#4ADE80', color2: '#22C55E', accent: '#1a1a1a' }, // Green
    { bg: 'linear-gradient(160deg, #FB923C 0%, #F97316 50%, #FB923C 100%)', color1: '#FB923C', color2: '#F97316', accent: '#fff' }, // Orange
    { bg: 'linear-gradient(160deg, #60A5FA 0%, #3B82F6 50%, #60A5FA 100%)', color1: '#60A5FA', color2: '#3B82F6', accent: '#fff' }, // Blue
    { bg: 'linear-gradient(160deg, #F472B6 0%, #EC4899 50%, #F472B6 100%)', color1: '#F472B6', color2: '#EC4899', accent: '#fff' }, // Pink
  ];

  getCardTheme() {
    const index = this.colorIndex % this.colorThemes.length;
    return this.colorThemes[index];
  }

  isModalOpen = false;
  isContactModalOpen = false;
  contactSent = false;

  // Contact form data
  contactForm = {
    fromName: '',
    fromEmail: '',
    message: '',
    projectType: 'collaboration',
    skills: ''
  };

  projectTypes = [
    { value: 'collaboration', label: '🤝 Collaboration sur projet' },
    { value: 'mentoring', label: '📚 Demande de mentorat' },
    { value: 'job', label: '💼 Opportunité professionnelle' },
    { value: 'learning', label: '🎓 Échange de compétences' },
    { value: 'other', label: '💬 Autre' }
  ];

  constructor(private collaborationService: CollaborationService) {}

  private animationFrameId: number | null = null;
  private hoverTimeoutId: number | undefined;
  private isHovering = false;

  private currentX = 0;
  private currentY = 0;
  private targetX = 0;
  private targetY = 0;
  private currentGradX = 50;
  private currentGradY = 50;
  private targetGradX = 50;
  private targetGradY = 50;

  private readonly avatarColors = [
    '#22c55e', '#3DB4AD', '#F97316', '#5ECEC7',
    '#FF7F6B', '#F5D547', '#8B5CF6', '#EC4899',
  ];

  private readonly categoryIcons: Record<string, string> = {
    technique: '💻',
    artistique: '🎨',
    physique: '💪',
    social: '🤝',
    analytique: '📊',
    créatif: '✨',
    leadership: '👑'
  };

  private readonly categoryEnergy: Record<string, string> = {
    technique: 'electric',
    artistique: 'psychic',
    physique: 'fire',
    social: 'grass',
    analytique: 'water',
    créatif: 'rainbow',
    leadership: 'fire'
  };

  @HostListener('document:keydown.escape')
  onEscapeKey() {
    if (this.isModalOpen) {
      this.closeModal();
    }
  }

  ngAfterViewInit(): void {
    this.initHoloEffect();
  }

  ngOnDestroy(): void {
    if (this.hoverTimeoutId !== undefined) {
      window.clearTimeout(this.hoverTimeoutId);
    }
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    const card = this.cardEl?.nativeElement;
    if (card) {
      card.removeEventListener('mousemove', this.handleMove);
      card.removeEventListener('touchmove', this.handleMove);
      card.removeEventListener('mouseenter', this.handleEnter);
      card.removeEventListener('mouseleave', this.handleLeave);
      card.removeEventListener('touchend', this.handleLeave);
      card.removeEventListener('touchcancel', this.handleLeave);
    }
    document.body.style.overflow = '';
  }

  openModal() {
    this.isModalOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    this.isModalOpen = false;
    document.body.style.overflow = '';
  }

  onOverlayClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.closeModal();
    }
    if ((event.target as HTMLElement).classList.contains('contact-modal-overlay')) {
      this.closeContactModal();
    }
  }

  // ========== CONTACT MODAL ==========

  openContactModal(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.isContactModalOpen = true;
    this.contactSent = false;
    document.body.style.overflow = 'hidden';
  }

  closeContactModal() {
    this.isContactModalOpen = false;
    document.body.style.overflow = '';
    // Reset form
    this.contactForm = {
      fromName: '',
      fromEmail: '',
      message: '',
      projectType: 'collaboration',
      skills: ''
    };
  }

  sendContactRequest() {
    if (!this.contactForm.fromName || !this.contactForm.fromEmail || !this.contactForm.message) {
      return;
    }

    const skills = this.contactForm.skills
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    this.collaborationService.createRequest({
      fromName: this.contactForm.fromName,
      fromEmail: this.contactForm.fromEmail,
      toTalentId: this.talent.id,
      toTalentName: this.talent.nom,
      toTalentEmail: this.talent.email || '',
      message: this.contactForm.message,
      projectType: this.contactForm.projectType,
      skills: skills
    });

    this.contactSent = true;

    // Auto-close after 2 seconds
    setTimeout(() => {
      this.closeContactModal();
    }, 2500);
  }

  getProjectTypeLabel(type: string): string {
    const found = this.projectTypes.find(p => p.value === type);
    return found ? found.label : type;
  }

  private lerp(start: number, end: number, factor: number): number {
    return start + (end - start) * factor;
  }

  private animationLoop = () => {
    const card = this.cardEl?.nativeElement;
    if (!card) return;
    
    const lerpFactor = 0.08;

    this.currentX = this.lerp(this.currentX, this.targetX, lerpFactor);
    this.currentY = this.lerp(this.currentY, this.targetY, lerpFactor);
    this.currentGradX = this.lerp(this.currentGradX, this.targetGradX, lerpFactor);
    this.currentGradY = this.lerp(this.currentGradY, this.targetGradY, lerpFactor);

    card.style.setProperty('--rotateX', `${this.currentY}deg`);
    card.style.setProperty('--rotateY', `${this.currentX}deg`);
    card.style.setProperty('--gradX', `${this.currentGradX}%`);
    card.style.setProperty('--gradY', `${this.currentGradY}%`);

    const deltaX = Math.abs(this.currentX - this.targetX);
    const deltaY = Math.abs(this.currentY - this.targetY);

    if (this.isHovering || deltaX > 0.01 || deltaY > 0.01) {
      this.animationFrameId = requestAnimationFrame(this.animationLoop);
    } else {
      this.animationFrameId = null;
    }
  };

  private startAnimationLoop() {
    if (this.animationFrameId === null) {
      this.animationFrameId = requestAnimationFrame(this.animationLoop);
    }
  }

  private handleEnter = () => {
    const card = this.cardEl?.nativeElement;
    if (!card) return;
    
    this.isHovering = true;
    card.classList.remove('animated');
    card.classList.add('active');

    if (this.hoverTimeoutId !== undefined) {
      window.clearTimeout(this.hoverTimeoutId);
      this.hoverTimeoutId = undefined;
    }

    this.startAnimationLoop();
  };

  private handleMove = (e: MouseEvent | TouchEvent) => {
    const card = this.cardEl?.nativeElement;
    if (!card) return;
    
    let clientX: number;
    let clientY: number;

    if (e.type === 'touchmove') {
      const touchEvent = e as TouchEvent;
      const touch = touchEvent.touches[0];
      clientX = touch.clientX;
      clientY = touch.clientY;
      e.preventDefault();
    } else {
      const mouseEvent = e as MouseEvent;
      clientX = mouseEvent.clientX;
      clientY = mouseEvent.clientY;
    }

    const rect = card.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const maxRotation = 12;
    const percentX = (clientX - centerX) / (rect.width / 2);
    const percentY = (clientY - centerY) / (rect.height / 2);

    this.targetX = percentX * maxRotation;
    this.targetY = -percentY * maxRotation;

    const relX = ((clientX - rect.left) / rect.width) * 100;
    const relY = ((clientY - rect.top) / rect.height) * 100;
    this.targetGradX = relX;
    this.targetGradY = relY;

    this.startAnimationLoop();
  };

  private handleLeave = () => {
    const card = this.cardEl?.nativeElement;
    if (!card) return;
    
    this.isHovering = false;
    this.targetX = 0;
    this.targetY = 0;
    this.targetGradX = 50;
    this.targetGradY = 50;

    card.classList.remove('active');
    this.startAnimationLoop();

    this.hoverTimeoutId = window.setTimeout(() => {
      card.classList.add('animated');
    }, 1500);
  };

  private initHoloEffect() {
    const card = this.cardEl?.nativeElement;
    if (!card) return;

    card.style.setProperty('--rotateX', '0deg');
    card.style.setProperty('--rotateY', '0deg');
    card.style.setProperty('--gradX', '50%');
    card.style.setProperty('--gradY', '50%');

    card.addEventListener('mouseenter', this.handleEnter);
    card.addEventListener('mousemove', this.handleMove);
    card.addEventListener('touchmove', this.handleMove, { passive: false });
    card.addEventListener('mouseleave', this.handleLeave);
    card.addEventListener('touchend', this.handleLeave);
    card.addEventListener('touchcancel', this.handleLeave);
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  // ========== PUBLIC METHODS ==========

  avatarStyle() {
    if (this.talent.avatarColor) {
      return { 'background-color': this.talent.avatarColor };
    }
    const hash = this.hashString(this.talent.nom || 'default');
    const colorIndex = hash % this.avatarColors.length;
    return { 'background-color': this.avatarColors[colorIndex] };
  }

  getLevelNumber(): number {
    const levels: Record<string, number> = {
      'débutant': 1,
      'intermédiaire': 2,
      'avancé': 3,
      'expert': 4,
      'maître': 5,
      'légendaire': 6
    };
    return levels[this.talent.niveau] || 1;
  }

  getXP(): number {
    if (this.talent.xpActuel) return this.talent.xpActuel;
    const baseXP = 200;
    const skillBonus = (this.talent.competences?.length || 0) * 30;
    const projectBonus = (this.talent.projets?.length || 0) * 60;
    const levelMultiplier = this.getLevelNumber();
    return baseXP + skillBonus + projectBonus + (levelMultiplier * 80);
  }

  getCategoryIcon(): string {
    const cat = this.talent.categorie || 'technique';
    return this.categoryIcons[cat] || '💻';
  }

  getEnergyType(index: number): string {
    const cat = this.talent.categorie || 'technique';
    const baseEnergy = this.categoryEnergy[cat] || 'electric';
    
    if (index === 0) return baseEnergy;
    
    const energies = ['fire', 'water', 'electric', 'grass', 'psychic'];
    const hash = this.hashString(this.talent.competences?.[index] || 'skill');
    return energies[hash % energies.length];
  }

  getSkillDamage(index: number): number {
    const baseDamage = 25 + (index * 25);
    const levelBonus = this.getLevelNumber() * 8;
    const statBonus = this.talent.stats ? Math.floor(this.talent.stats.principale.valeur / 8) : 0;
    return baseDamage + levelBonus + statBonus;
  }

  getImpactDamage(): string {
    const impact = this.talent.stats?.impact || 'moyen';
    const labels: Record<string, string> = {
      'faible': '80+',
      'moyen': '150+',
      'fort': '200+',
      'destructeur': '300+'
    };
    return labels[impact] || '150+';
  }

  getAllSkills(): string[] {
    return this.talent.competences || [];
  }

  getStrengths(): string[] {
    return this.talent.forcesPrincipales || [];
  }
}
