import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { Talent, TalentService } from '../../../services/talent.service';
import { Card } from '../card/card';

@Component({
  selector: 'app-talent-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, Card],
  templateUrl: './talent-list.html',
  styleUrls: ['./talent-list.css']
})
export class TalentList implements OnInit, OnDestroy {
  allTalents: Talent[] = [];
  filteredTalents: Talent[] = [];

  search = '';
  villeFilter = '';
  onlyVerified = false;

  villes: string[] = [];

  private subscription?: Subscription;

  constructor(private talentService: TalentService) {}

  ngOnInit() {
    // S'abonner aux changements de talents
    this.subscription = this.talentService.talents$.subscribe(talents => {
      this.allTalents = talents;
      this.updateVilles();
      this.applyFilters();
      console.log('📋 Liste des talents mise à jour:', talents.length);
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  private updateVilles() {
    this.villes = Array.from(
      new Set(this.allTalents.map(t => t.ville).filter(Boolean) as string[])
    ).sort();
  }

  applyFilters() {
    const q = this.search.toLowerCase().trim();
    const ville = this.villeFilter.toLowerCase();
    const onlyVerified = this.onlyVerified;

    this.filteredTalents = this.allTalents.filter(t => {
      if (onlyVerified && !t.verified) return false;
      if (ville && t.ville?.toLowerCase() !== ville) return false;
      if (!q) return true;

      const haystack = [
        t.nom,
        t.role,
        t.ville,
        t.promo,
        t.bio,
        ...t.langues,
        ...t.competences,
        ...t.passions,
        ...t.projets,
        ...t.tags
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(q);
    });
  }

  // Méthode pour supprimer un talent (optionnel)
  deleteTalent(id: string) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce talent ?')) {
      this.talentService.deleteTalent(id);
    }
  }
}
