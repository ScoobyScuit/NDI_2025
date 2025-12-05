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
  },
  {
    path: 'ergonomie/labyrinthe-temporel',
    loadComponent: () => import('./defis/ergonomie/pages/temporal-maze-test/temporal-maze-test.component')
      .then(m => m.TemporalMazeTestComponent),
    title: 'Défis Ergonomie'
  },
    {
        path: '',
        redirectTo: 'landing-page',
        pathMatch: 'full'
    },
    {
        path: 'landing-page',
        loadComponent: () => import('./defis/carte-talents/pages/landing-page/landing-page').then(m => m.LandingPage),
        data: { animation: 'LandingPage' }
    },
    {
        path: 'talents',
        loadComponent: () => import('./defis/carte-talents/pages/talent-page/talent-page').then(m => m.TalentPage),
        data: { animation: 'TalentsPage' }
    },
    {
        path: 'talent-page',
        redirectTo: 'talents',
        pathMatch: 'full'
    },
    {
        path: 'add-talent',
        loadComponent: () => import('./defis/carte-talents/pages/add-talent-page/add-talent-page').then(m => m.AddTalentPage),
        data: { animation: 'AddTalentPage' }
    },
    {
        path: 'collaborations',
        loadComponent: () => import('./defis/carte-talents/pages/collaborations-page/collaborations-page').then(m => m.CollaborationsPage),
        data: { animation: 'CollaborationsPage' }
    }
];
