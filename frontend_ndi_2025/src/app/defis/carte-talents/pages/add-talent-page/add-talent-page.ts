import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { TalentForm } from '../../component/talent-container/talent-form/talent-form';
import { Card } from '../../component/talent-container/card/card';
import { Talent } from '../../services/talent.service';

@Component({
  selector: 'app-add-talent-page',
  standalone: true,
  imports: [CommonModule, RouterLink, TalentForm, Card],
  templateUrl: './add-talent-page.html',
  styleUrls: ['./add-talent-page.css']
})
export class AddTalentPage {
  createdTalent: Talent | null = null;
  showSuccess = false;

  constructor(private router: Router) {}

  onTalentCreated(talent: Talent) {
    this.createdTalent = talent;
    this.showSuccess = true;
    
    // Scroll to preview
    setTimeout(() => {
      const preview = document.querySelector('.preview-section');
      preview?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  goToTalents() {
    this.router.navigate(['/talents']);
  }

  createAnother() {
    this.createdTalent = null;
    this.showSuccess = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

