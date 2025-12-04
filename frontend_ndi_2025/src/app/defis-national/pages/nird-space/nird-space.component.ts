import { Component, signal, computed, HostListener, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RocketComponent } from '../../component/rocket/rocket.component';
import { PlanetComponent, Planet } from '../../component/planet/planet.component';
import { BlackHoleComponent, BlackHole } from '../../component/black-hole/black-hole.component';
import { ArcadeCabinetComponent } from '../../component/arcade-cabinet/arcade-cabinet.component';
import { InfoModalComponent } from '../../component/info-modal/info-modal.component';
import { StarsBackgroundComponent } from '../../component/stars-background/stars-background.component';
// Import du composant rétro
import { RetroComputerComponent } from '../../component/retro-computer/retro-computer.component';

@Component({
  selector: 'app-nird-space',
  standalone: true,
  imports: [
    CommonModule,
    RocketComponent,
    PlanetComponent,
    BlackHoleComponent,
    ArcadeCabinetComponent,
    InfoModalComponent,
    StarsBackgroundComponent,
    RetroComputerComponent
  ],
  templateUrl: './nird-space.component.html',
  styleUrl: './nird-space.component.css'
})
export class NirdSpaceComponent implements OnInit, OnDestroy {
  // Rocket position
  rocketX = signal(50);
  rocketY = signal(85);
  rocketRotation = signal(0);
  
  // Game state
  isFlying = signal(false);
  currentPlanet = signal<Planet | null>(null);
  showModal = signal(false);
  gameStarted = signal(false);
  allVisited = signal(false);

  // Configuration Trou Noir
  blackHole: BlackHole = {
    id: 'central-singularity',
    name: 'SINGULARITÉ NIRD',
    x: 50, y: 50, size: 180, pullStrength: 5
  };

  // --- PHYSIQUE ---
  private rocketDistanceToBlackHole = computed(() => {
    if (!this.gameStarted()) return 100;
    const dx = this.rocketX() - this.blackHole.x;
    const dy = this.rocketY() - this.blackHole.y;
    return Math.sqrt(dx * dx + dy * dy);
  });

  private proximityRatio = computed(() => {
    const dist = this.rocketDistanceToBlackHole();
    const startRadius = 16; 
    const endRadius = 1;
    if (dist > startRadius) return 0;
    if (dist < endRadius) return 1;
    return 1 - ((dist - endRadius) / (startRadius - endRadius));
  });

  rocketScale = computed(() => 1 - (this.proximityRatio() * 0.95));
  blackHoleSpeedMultiplier = computed(() => 1 + (Math.pow(this.proximityRatio(), 2) * 40));
  isNearBlackHole = computed(() => this.rocketDistanceToBlackHole() < 18);
  
  private keys = new Set<string>();
  private animationFrame: number | null = null;
  private readonly speed = 0.8;

  // --- PLANÈTES (Incluant l'IBM) ---
  planets = signal<Planet[]>([
    {
      id: 'constat',
      name: 'CONSTAT',
      x: 15, y: 20, size: 90, color: '#ff6b6b', glowColor: '#ff000080', icon: '⚠️', 
      title: '🔴 LE CONSTAT', content: ['...'], visited: false 
    },
    {
      id: 'technique',
      name: 'TECHNIQUE',
      x: 75, y: 35, size: 100, color: '#4ecdc4', glowColor: '#00ffcc80', icon: '🐧', 
      title: '🐧 TECHNIQUE', content: ['...'], visited: false 
    },
    {
      id: 'materiel',
      name: 'MATÉRIEL',
      x: 25, y: 55, size: 85, color: '#f9ca24', glowColor: '#ffcc0080', icon: '🔧', 
      title: '🔧 MATÉRIEL', content: ['...'], visited: false 
    },
    {
      id: 'pedagogique',
      name: 'PÉDAGOGIE',
      x: 70, y: 65, size: 95, color: '#a55eea', glowColor: '#9900ff80', icon: '👨‍🎓', 
      title: '👨‍🎓 PÉDAGOGIE', content: ['...'], visited: false 
    },
    {
      id: 'methode',
      name: 'MÉTHODE',
      x: 50, y: 15, size: 110, color: '#ff9ff3', glowColor: '#ff66cc80', icon: '📋', 
      title: '📋 MÉTHODE', content: ['...'], visited: false 
    },
  ]);

  // Helper pour récupérer l'objet IBM dans le HTML
  ibmPlanet = computed(() => this.planets().find(p => p.id === 'ibm'));

  visitedCount = computed(() => this.planets().filter((p: Planet) => p.visited).length);
  totalPlanets = computed(() => this.planets().length);

  ngOnInit() { this.startGameLoop(); }
  ngOnDestroy() { if (this.animationFrame) cancelAnimationFrame(this.animationFrame); }
  startGame() { this.gameStarted.set(true); this.isFlying.set(true); }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (!this.gameStarted() || this.showModal()) return;
    this.keys.add(event.key.toLowerCase());
    if (event.key === ' ' || event.key === 'Enter') this.checkPlanetCollision();
  }
  @HostListener('window:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent) { this.keys.delete(event.key.toLowerCase()); }

  private startGameLoop() {
    const gameLoop = () => {
      if (this.gameStarted() && !this.showModal()) this.updateRocketPosition();
      this.animationFrame = requestAnimationFrame(gameLoop);
    };
    gameLoop();
  }

  private updateRocketPosition() {
    let dx = 0, dy = 0;
    if (this.keys.has('arrowup') || this.keys.has('z') || this.keys.has('w')) dy = -this.speed;
    if (this.keys.has('arrowdown') || this.keys.has('s')) dy = this.speed;
    if (this.keys.has('arrowleft') || this.keys.has('q') || this.keys.has('a')) dx = -this.speed;
    if (this.keys.has('arrowright') || this.keys.has('d')) dx = this.speed;

    const ratio = this.proximityRatio();
    
    if (ratio > 0) {
      const dist = this.rocketDistanceToBlackHole();
      const vecX = this.blackHole.x - this.rocketX();
      const vecY = this.blackHole.y - this.rocketY();
      const maxGravity = 0.7; // Gravité réduite pour sortir facilement
      const gravityStrength = (ratio * ratio) * maxGravity;
      
      dx += (vecX / dist) * gravityStrength;
      dy += (vecY / dist) * gravityStrength;

      const chaosIntensity = ratio * 3.0; 
      dx += (Math.random() - 0.5) * chaosIntensity;
      dy += (Math.random() - 0.5) * chaosIntensity;
    }

    if (dx !== 0 || dy !== 0) {
      this.rocketX.set(Math.max(2, Math.min(98, this.rocketX() + dx)));
      this.rocketY.set(Math.max(2, Math.min(98, this.rocketY() + dy)));
      
      let angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
      if (ratio > 0) angle += (Math.random() - 0.5) * 360 * (ratio * ratio);
      this.rocketRotation.set(angle);
    }
  }

  private checkPlanetCollision() {
    const rocket = { x: this.rocketX(), y: this.rocketY() };
    for (const planet of this.planets()) {
      const distance = Math.sqrt(Math.pow(rocket.x - planet.x, 2) + Math.pow(rocket.y - planet.y, 2));
      if (distance < 12) { this.openPlanetInfo(planet); break; }
    }
  }

  openPlanetInfo(planet: Planet) {
    this.currentPlanet.set(planet);
    this.showModal.set(true);
    this.planets.update(planets => planets.map(p => p.id === planet.id ? { ...p, visited: true } : p));
    if (this.planets().filter(p => p.visited).length === this.totalPlanets()) this.allVisited.set(true);
  }

  closeModal() { this.showModal.set(false); this.currentPlanet.set(null); }
  onPlanetClick(planet: Planet) { if (this.gameStarted()) this.openPlanetInfo(planet); }
  isNearPlanet(planet: Planet): boolean {
    const rocket = { x: this.rocketX(), y: this.rocketY() };
    return Math.sqrt(Math.pow(rocket.x - planet.x, 2) + Math.pow(rocket.y - planet.y, 2)) < 12;
  }
}