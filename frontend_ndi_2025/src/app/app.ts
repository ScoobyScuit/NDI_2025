import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoadingScreen } from './components/loading-screen/loading-screen';
import { routeAnimations } from './animations/route-animations';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LoadingScreen],
  templateUrl: './app.html',
  styleUrl: './app.css',
  animations: [routeAnimations]
})
export class App {
  protected readonly title = signal('frontend_ndi_2025');

  prepareRoute(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  }
}
