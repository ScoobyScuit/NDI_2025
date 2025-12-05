import { Component, Input, Output, EventEmitter, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TalentService, Talent } from '../../../defis/carte-talents/services/talent.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-card-talents',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card-talents.component.html',
  styleUrls: ['./card-talents.component.css']
})
export class CardTalentsComponent implements OnInit, OnDestroy {
  @Input() isNear: boolean = false;
  @Output() cardTalentsClick = new EventEmitter<void>();
  
  displayLines = signal<string[]>([]);
  talentCount = signal(0);
  previewTalent = signal<Talent | null>(null);
  
  private talentSubscription: Subscription | null = null;
  private intervalId: any;

  private messages = [
    "TALENTS NIRD",
    "PROFILS ACTIFS",
    "CLIQUEZ POUR",
    "EXPLORER..."
  ];

  constructor(
    private talentService: TalentService,
    private router: Router
  ) {}

  ngOnInit() {
    this.bootSequence();
    this.talentSubscription = this.talentService.talents$.subscribe(talents => {
      this.talentCount.set(talents.length);
      if (talents.length > 0) {
        // Sélectionner un talent aléatoire pour la preview
        const randomIndex = Math.floor(Math.random() * talents.length);
        this.previewTalent.set(talents[randomIndex]);
      }
    });
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
    if (this.talentSubscription) this.talentSubscription.unsubscribe();
  }

  private bootSequence() {
    let lineIndex = 0;
    this.intervalId = setInterval(() => {
      if (lineIndex < this.messages.length) {
        this.displayLines.update(lines => [...lines, this.messages[lineIndex]]);
        lineIndex++;
      } else {
        clearInterval(this.intervalId);
      }
    }, 500);
  }

  onClick() {
    this.cardTalentsClick.emit();
    this.navigateToTalents();
  }

  navigateToTalents() {
    this.router.navigate(['/landing-page']);
  }

  getInitial(): string {
    const talent = this.previewTalent();
    return talent ? talent.nom.charAt(0).toUpperCase() : '?';
  }

  getAvatarColor(): string {
    const talent = this.previewTalent();
    return talent?.avatarColor || '#3DB4AD';
  }
}
