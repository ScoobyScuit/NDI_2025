import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortalMenuComponent } from '../portal-menu/portal-menu.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-portal-burger',
  standalone: true,
  imports: [CommonModule, PortalMenuComponent],
  templateUrl: './portal-burger.component.html',
  styleUrls: ['./portal-burger.component.css']
})
export class PortalBurgerComponent {
  showPortalMenu = signal(false);

  constructor(private router: Router) {}

  toggleMenu() {
    this.showPortalMenu.update(v => !v);
  }

  closeMenu() {
    this.showPortalMenu.set(false);
  }

  // Pour le chat, on redirige vers la page principale avec le chat
  onOpenChat() {
    this.closeMenu();
    this.router.navigate(['/nird']);
  }
}
