import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'nird',
    pathMatch: 'full'
  },
  {
    path: 'nird',
    loadComponent: () => import('./defis-national/pages/nird-space/nird-space.component')
      .then(m => m.NirdSpaceComponent),
    title: 'NIRD Space Mission - Défi National'
  }
];
