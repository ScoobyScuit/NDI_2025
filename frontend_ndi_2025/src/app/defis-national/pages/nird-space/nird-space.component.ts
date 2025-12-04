import { Component, signal, computed, HostListener, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RocketComponent } from '../../component/rocket/rocket.component';
import { PlanetComponent } from '../../component/planet/planet.component';
import { ArcadeCabinetComponent } from '../../component/arcade-cabinet/arcade-cabinet.component';
import { InfoModalComponent } from '../../component/info-modal/info-modal.component';
import { StarsBackgroundComponent } from '../../component/stars-background/stars-background.component';

export interface Planet {
  id: string;
  name: string;
  x: number;
  y: number;
  size: number;
  color: string;
  glowColor: string;
  icon: string;
  title: string;
  content: string[];
  visited: boolean;
}

@Component({
  selector: 'app-nird-space',
  standalone: true,
  imports: [
    CommonModule,
    RocketComponent,
    PlanetComponent,
    ArcadeCabinetComponent,
    InfoModalComponent,
    StarsBackgroundComponent
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
  
  // Movement
  private keys = new Set<string>();
  private animationFrame: number | null = null;
  private readonly speed = 0.8;

  planets = signal<Planet[]>([
    {
      id: 'constat',
      name: 'CONSTAT',
      x: 15,
      y: 20,
      size: 90,
      color: '#ff6b6b',
      glowColor: '#ff000080',
      icon: '⚠️',
      title: '🔴 LE CONSTAT : Pourquoi agir ?',
      content: [
        '💥 <strong>Le déclencheur :</strong> Fin du support Windows 10 en octobre 2025',
        '🗑️ Des millions d\'ordinateurs fonctionnels rendus obsolètes',
        '🌍 <strong>Problème écologique :</strong> Jeter du matériel qui marche = désastre environnemental',
        '💸 <strong>Problème économique :</strong> Licences coûteuses + renouvellement forcé',
        '🔒 <strong>Souveraineté :</strong> Données hors UE, écosystèmes fermés, dépendance totale'
      ],
      visited: false
    },
    {
      id: 'technique',
      name: 'TECHNIQUE',
      x: 75,
      y: 35,
      size: 100,
      color: '#4ecdc4',
      glowColor: '#00ffcc80',
      icon: '🐧',
      title: '🐧 LEVIER TECHNIQUE : Le Libre',
      content: [
        '🔄 <strong>Remplacer Windows par Linux :</strong> système libre et gratuit',
        '♻️ Linux fonctionne sur ordinateurs anciens = prolonger la vie des machines',
        '📦 <strong>Logiciels Libres :</strong> LibreOffice, Firefox, GIMP...',
        '🏛️ La Forge des Communs Numériques : ressources libres pour l\'éducation',
        '🛡️ <strong>Résultat :</strong> Indépendance totale vis-à-vis des GAFAM'
      ],
      visited: false
    },
    {
      id: 'materiel',
      name: 'MATÉRIEL',
      x: 25,
      y: 55,
      size: 85,
      color: '#f9ca24',
      glowColor: '#ffcc0080',
      icon: '🔧',
      title: '🔧 LEVIER MATÉRIEL : Reconditionnement',
      content: [
        '🚫 <strong>Ne pas jeter :</strong> Lutter contre l\'obsolescence programmée',
        '📦 Récupérer les flottes d\'ordinateurs d\'entreprises',
        '🔄 Remettre à neuf avec Linux pour les élèves',
        '💰 Économies massives sur les budgets publics',
        '🌱 <strong>Impact :</strong> Réduction drastique des déchets électroniques'
      ],
      visited: false
    },
    {
      id: 'pedagogique',
      name: 'PÉDAGOGIE',
      x: 70,
      y: 65,
      size: 95,
      color: '#a55eea',
      glowColor: '#9900ff80',
      icon: '👨‍🎓',
      title: '👨‍🎓 LEVIER PÉDAGOGIQUE : Élèves vers Élèves',
      content: [
        '🎓 <strong>Les élèves acteurs :</strong> Ils apprennent à reconditionner',
        '💻 Installation de Linux par les élèves eux-mêmes',
        '🤝 Formation entre pairs : élèves forment leurs camarades',
        '🌟 Éco-délégués au cœur du dispositif',
        '🚀 <strong>Transformation :</strong> De consommateur passif à acteur éclairé'
      ],
      visited: false
    },
    {
      id: 'methode',
      name: 'MÉTHODE',
      x: 50,
      y: 15,
      size: 110,
      color: '#ff9ff3',
      glowColor: '#ff66cc80',
      icon: '📋',
      title: '📋 LA MÉTHODE : Les 3 Jalons',
      content: [
        '🏁 <strong>Jalon 1 - MOBILISATION :</strong> Un enseignant volontaire lance la dynamique',
        '🧪 <strong>Jalon 2 - EXPÉRIMENTATION :</strong> Linux sur quelques postes de test',
        '✅ <strong>Jalon 3 - INTÉGRATION :</strong> Généralisation dans le projet d\'établissement',
        '🏛️ Soutien officiel de la collectivité (mairie, région)',
        '🎯 <strong>Objectif :</strong> Du "David contre Goliath" au "Village Résistant"'
      ],
      visited: false
    }
  ]);

  visitedCount = computed(() => this.planets().filter((p: Planet) => p.visited).length);
  totalPlanets = computed(() => this.planets().length);

  ngOnInit() {
    this.startGameLoop();
  }

  ngOnDestroy() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }

  startGame() {
    this.gameStarted.set(true);
    this.isFlying.set(true);
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (!this.gameStarted() || this.showModal()) return;
    this.keys.add(event.key.toLowerCase());
    
    if (event.key === ' ' || event.key === 'Enter') {
      this.checkPlanetCollision();
    }
  }

  @HostListener('window:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent) {
    this.keys.delete(event.key.toLowerCase());
  }

  private startGameLoop() {
    const gameLoop = () => {
      if (this.gameStarted() && !this.showModal()) {
        this.updateRocketPosition();
      }
      this.animationFrame = requestAnimationFrame(gameLoop);
    };
    gameLoop();
  }

  private updateRocketPosition() {
    let dx = 0;
    let dy = 0;

    if (this.keys.has('arrowup') || this.keys.has('z') || this.keys.has('w')) dy = -this.speed;
    if (this.keys.has('arrowdown') || this.keys.has('s')) dy = this.speed;
    if (this.keys.has('arrowleft') || this.keys.has('q') || this.keys.has('a')) dx = -this.speed;
    if (this.keys.has('arrowright') || this.keys.has('d')) dx = this.speed;

    if (dx !== 0 || dy !== 0) {
      const newX = Math.max(5, Math.min(95, this.rocketX() + dx));
      const newY = Math.max(5, Math.min(90, this.rocketY() + dy));
      this.rocketX.set(newX);
      this.rocketY.set(newY);
      
      // Calculate rotation based on movement direction
      const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
      this.rocketRotation.set(angle);
    }
  }

  private checkPlanetCollision() {
    const rocket = { x: this.rocketX(), y: this.rocketY() };
    
    for (const planet of this.planets()) {
      const distance = Math.sqrt(
        Math.pow(rocket.x - planet.x, 2) + Math.pow(rocket.y - planet.y, 2)
      );
      
      if (distance < 12) {
        this.openPlanetInfo(planet);
        break;
      }
    }
  }

  openPlanetInfo(planet: Planet) {
    this.currentPlanet.set(planet);
    this.showModal.set(true);
    
    // Mark as visited
    this.planets.update((planets: Planet[]) => 
      planets.map((p: Planet) => p.id === planet.id ? { ...p, visited: true } : p)
    );
    
    // Check if all visited
    const allPlanetsVisited = this.planets().filter((p: Planet) => p.visited).length === this.totalPlanets();
    if (allPlanetsVisited) {
      this.allVisited.set(true);
    }
  }

  closeModal() {
    this.showModal.set(false);
    this.currentPlanet.set(null);
  }

  onPlanetClick(planet: Planet) {
    if (this.gameStarted()) {
      this.openPlanetInfo(planet);
    }
  }

  isNearPlanet(planet: Planet): boolean {
    const rocket = { x: this.rocketX(), y: this.rocketY() };
    const distance = Math.sqrt(
      Math.pow(rocket.x - planet.x, 2) + Math.pow(rocket.y - planet.y, 2)
    );
    return distance < 12;
  }
}

