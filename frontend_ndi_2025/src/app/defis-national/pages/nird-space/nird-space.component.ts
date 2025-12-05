import { Component, signal, computed, HostListener, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RocketComponent } from '../../component/rocket/rocket.component';
import { PlanetComponent, Planet } from '../../component/planet/planet.component';
import { BlackHoleComponent, BlackHole } from '../../component/black-hole/black-hole.component';
import { ArcadeCabinetComponent } from '../../component/arcade-cabinet/arcade-cabinet.component';
import { InfoModalComponent } from '../../component/info-modal/info-modal.component';
import { StarsBackgroundComponent } from '../../component/stars-background/stars-background.component';
import { RetroComputerComponent } from '../../component/retro-computer/retro-computer.component';
import { RetroMediaPlayerComponent } from '../../component/retro-mediaPlayer/retro-media-player.component';
import { CardTalentsComponent } from '../../component/card-talents/card-talents.component';
import { RetroFormComponent } from '../../component/retro-form/retro-form.component';
import { PortalMenuComponent } from '../../component/portal-menu/portal-menu.component';

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
    RetroComputerComponent,
    RetroMediaPlayerComponent,
    CardTalentsComponent,
    RetroFormComponent,
    PortalMenuComponent
  ],
  templateUrl: './nird-space.component.html',
  styleUrl: './nird-space.component.css'
})
export class NirdSpaceComponent implements OnInit, OnDestroy {
  // Références pour commander les composants interactifs
  @ViewChild(RetroComputerComponent) retroComputer!: RetroComputerComponent;
  @ViewChild(CardTalentsComponent) cardTalents!: CardTalentsComponent;
  @ViewChild(RetroFormComponent) retroForm!: RetroFormComponent;
  @ViewChild(RetroMediaPlayerComponent) retroMediaPlayer!: RetroMediaPlayerComponent;

  // Rocket position
  rocketX = signal(50);
  rocketY = signal(75);
  rocketRotation = signal(0);
  
  // Game state
  isFlying = signal(false);
  currentPlanet = signal<Planet | null>(null);
  showModal = signal(false);
  gameStarted = signal(false);
  allVisited = signal(false);
  showVictoryBanner = signal(false);
  showPortalMenu = signal(false);

  // Configuration Trou Noir
  blackHole: BlackHole = {
    id: 'central-singularity',
    name: ' ',
    x: 50, y: 50, size: 180, pullStrength: 5
  };

  // --- CONFIGURATION RETRO COMPUTER ---
  // Position fixe de l'ordinateur
  computerPos = { x: 89, y: 20}; 
  
  // Calcul de proximité pour l'animation - rayon réduit pour ne pas gêner
  isNearComputer = computed(() => {
    if (!this.gameStarted()) return false;
    const dist = Math.sqrt(
      Math.pow(this.rocketX() - this.computerPos.x, 2) + 
      Math.pow(this.rocketY() - this.computerPos.y, 2)
    );
    return dist < 8; // Rayon de détection réduit
  });

  // --- CONFIGURATION RETRO MEDIA PLAYER ---
  // Position fixe du media player (bas gauche, légèrement décalé)
  mediaPlayerPos = { x: 8, y: 78 };
  
  // Calcul de proximité pour l'animation
  isNearMediaPlayer = computed(() => {
    if (!this.gameStarted()) return false;
    const dist = Math.sqrt(
      Math.pow(this.rocketX() - this.mediaPlayerPos.x, 2) + 
      Math.pow(this.rocketY() - this.mediaPlayerPos.y, 2)
    );
    return dist < 12; // Rayon de détection
  });

  // --- CONFIGURATION CARD TALENTS ---
  // Position fixe en bas à droite
  cardTalentsPos = { x: 90, y: 80 };
  
  // Calcul de proximité pour l'animation
  isNearCardTalents = computed(() => {
    if (!this.gameStarted()) return false;
    const dist = Math.sqrt(
      Math.pow(this.rocketX() - this.cardTalentsPos.x, 2) + 
      Math.pow(this.rocketY() - this.cardTalentsPos.y, 2)
    );
    return dist < 12; // Rayon de détection
  });

  // --- CONFIGURATION RETRO FORM ---
  // Position fixe en haut à gauche
  retroFormPos = { x: 10, y: 20 };
  
  // Calcul de proximité pour l'animation
  isNearRetroForm = computed(() => {
    if (!this.gameStarted()) return false;
    const dist = Math.sqrt(
      Math.pow(this.rocketX() - this.retroFormPos.x, 2) + 
      Math.pow(this.rocketY() - this.retroFormPos.y, 2)
    );
    return dist < 12; // Rayon de détection
  });

  // --- PHYSIQUE TROU NOIR ---
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
  // Rayon de 20 pour l'indication visuelle ET l'interaction
  isNearBlackHole = computed(() => this.rocketDistanceToBlackHole() < 20);
  
  private keys = new Set<string>();
  private animationFrame: number | null = null;
  private readonly speed = 0.8;

  // --- PLANETES ---
  planets = signal<Planet[]>([
    {
      id: 'constat',
      name: 'CONSTAT',
      x: 30, y: 25, size: 90, color: '#ff6b6b', glowColor: '#ff000080', icon: ' ', 
      title: '🔴 LE CONSTAT : La menace Big Tech', 
      content: [
        '💥 <strong>LE DECLENCHEUR :</strong> Fin du support Windows 10 en octobre 2025, Microsoft force la mise à jour vers Windows 11',
        '🗑️ <strong>OBSOLESCENCE PROGRAMMEE :</strong> Des millions d\'ordinateurs parfaitement fonctionnels seront déclarés "incompatibles" simplement parce qu\'ils ne supportent pas Windows 11',
        '🌍 <strong>DESASTRE ECOLOGIQUE :</strong> Jeter du matériel qui marche encore crée des tonnes de déchets électroniques, un scandale environnemental !',
        '💸 <strong>GOUFFRE FINANCIER :</strong> Licences Windows coûteuses (100-200€/poste), abonnements Microsoft 365, renouvellement forcé du parc informatique',
        '🔒 <strong>PERTE DE SOUVERAINETE :</strong> Données des élèves stockées hors UE (serveurs américains), écosystèmes fermés dont on devient captif',
        '⛓️ <strong>DEPENDANCE TOTALE :</strong> Format de fichiers propriétaires, mises à jour imposées, fonctionnalités supprimées sans préavis',
        '🏫 <strong>IMPACT SCOLAIRE :</strong> Les établissements sont pieds et poings liés face aux décisions des géants du numérique (GAFAM)'
      ], 
      visited: false 
    },
    {
      id: 'technique',
      name: 'TECHNIQUE',
      x: 75, y: 35, size: 100, color: '#4ecdc4', glowColor: '#00ffcc80', icon: ' ', 
      title: '🐧 LEVIER TECHNIQUE : Passer au Libre', 
      content: [
        '🔄 <strong>LINUX, LA SOLUTION :</strong> Système d\'exploitation 100% libre et gratuit, alternative complète à Windows sans aucune licence à payer',
        '💻 <strong>SECONDE VIE :</strong> Linux fonctionne parfaitement sur des ordinateurs de 10-15 ans ! Les machines "refusées" par Windows 11 reprennent vie',
        '📦 <strong>LOGICIELS LIBRES :</strong> LibreOffice (suite bureautique), Firefox (navigateur), GIMP (retouche photo), VLC (lecteur multimédia)...',
        '🏛️ <strong>LA FORGE DES COMMUNS :</strong> Plateforme nationale de ressources libres pour l\'éducation, apps.education.fr',
        '🔐 <strong>SECURITE RENFORCEE :</strong> Le code open source est audité par des milliers de développeurs, moins de failles, plus de transparence',
        '🛡️ <strong>INDEPENDANCE TOTALE :</strong> Plus de mises à jour forcées, plus de télémétrie, plus de publicités intégrées dans l\'OS',
        '🇫🇷 <strong>SOUVERAINETE :</strong> Vos données restent en France, sous contrôle de l\'établissement, conformité RGPD garantie',
        '🎓 <strong>COMPETENCES TRANSFERABLES :</strong> Les élèves découvrent le fonctionnement réel d\'un ordinateur, au-delà des interfaces fermées'
      ], 
      visited: false 
    },
    {
      id: 'materiel',
      name: 'MATERIEL',
      x: 25, y: 55, size: 85, color: '#f9ca24', glowColor: '#ffcc0080', icon: ' ', 
      title: '🔧 LEVIER MATERIEL : Reconditionnement', 
      content: [
        '🚫 <strong>STOP AU GASPILLAGE :</strong> Un ordinateur peut fonctionner 15-20 ans avec Linux, arrêtons de jeter ce qui marche !',
        '📦 <strong>RECUPERATION :</strong> Entreprises, administrations, particuliers donnent leurs anciennes machines, une mine d\'or inexploitée',
        '🔄 <strong>RECONDITIONNEMENT :</strong> Nettoyage, remplacement de pièces usées (RAM, SSD), installation de Linux = PC comme neuf',
        '💰 <strong>ECONOMIES MASSIVES :</strong> Un PC reconditionné coûte 50-100€ contre 500-800€ pour un neuf, budget divisé par 5 à 10 !',
        '🌱 <strong>IMPACT ECOLOGIQUE :</strong> Réduction drastique de l\'empreinte carbone, fabriquer un PC neuf = 300kg de CO2',
        '🤝 <strong>ECONOMIE CIRCULAIRE :</strong> Collaboration avec les entreprises locales qui renouvellent leur parc, gagnant-gagnant',
        '📊 <strong>EXEMPLE CONCRET :</strong> Le lycée Carnot a reconditionné +200 PC qui auraient fini à la déchetterie',
        '⚡ <strong>PERFORMANCE :</strong> Un vieux PC avec SSD et Linux démarre en 15 secondes, plus rapide qu\'un neuf avec Windows !'
      ], 
      visited: false 
    },
    {
      id: 'pedagogique',
      name: 'PEDAGOGIE',
      x: 70, y: 65, size: 95, color: '#a55eea', glowColor: '#9900ff80', icon: ' ', 
      title: '👨‍🎓 LEVIER PEDAGOGIQUE : Elèves vers Elèves', 
      content: [
        '🎓 <strong>ELEVES ACTEURS :</strong> Ce ne sont pas des techniciens externes mais les élèves eux-mêmes qui reconditionnent les PC !',
        '💻 <strong>APPRENTISSAGE PRATIQUE :</strong> Démontage, nettoyage, diagnostic, remplacement de composants, installation de Linux',
        '🤝 <strong>TRANSMISSION :</strong> Les élèves formés deviennent formateurs pour leurs camarades, effet boule de neige',
        '🌟 <strong>ECO-DELEGUES :</strong> Au cœur du dispositif, ils portent le projet et sensibilisent toute la communauté scolaire',
        '🚀 <strong>TRANSFORMATION :</strong> De "consommateur passif" de technologie à "acteur éclairé" qui comprend et maîtrise son outil',
        '📚 <strong>COMPETENCES ACQUISES :</strong> Hardware, software, réseau, sécurité, travail en équipe, transmission de savoirs',
        '🎯 <strong>VALORISATION :</strong> Les élèves peuvent valoriser cette expérience sur Parcoursup et leur CV, compétences recherchées !',
        '💡 <strong>ESPRIT CRITIQUE :</strong> Comprendre les enjeux du numérique, l\'obsolescence programmée, la souveraineté des données',
        '🏆 <strong>FIERTE :</strong> "J\'ai donné une seconde vie à un ordinateur qui allait à la poubelle !"'
      ], 
      visited: false 
    },
    {
      id: 'methode',
      name: 'METHODE',
      x: 50, y: 15, size: 110, color: '#ff9ff3', glowColor: '#ff66cc80', icon: ' ', 
      title: '📋 LA METHODE NIRD : 3 Jalons', 
      content: [
        '🏁 <strong>JALON 1 - MOBILISATION :</strong> Un enseignant volontaire se désigne comme "référent NIRD", informe la direction et contacte la collectivité locale',
        '📢 <strong>SENSIBILISATION :</strong> Présentation du projet en conseil pédagogique, réunion avec les éco-délégués, information aux familles',
        '🧪 <strong>JALON 2 - EXPERIMENTATION :</strong> Installation de Linux sur 5-10 postes (neufs ou reconditionnés) pour tester en conditions réelles',
        '📊 <strong>PREUVE DE CONCEPT :</strong> Les professeurs et élèves testent pendant quelques mois, retours d\'expérience documentés',
        '✅ <strong>JALON 3 - INTEGRATION :</strong> La démarche est généralisée et inscrite dans le projet d\'établissement',
        '🏛️ <strong>SOUTIEN INSTITUTIONNEL :</strong> Partenariat officiel avec la collectivité (mairie, département, région) pour pérenniser',
        '🌐 <strong>COMMUNAUTE NIRD :</strong> Rejoignez le réseau national des établissements engagés, entraide et partage d\'expériences',
        '🎯 <strong>L\'OBJECTIF FINAL :</strong> Passer de "David contre Goliath" à "Village Gaulois Résistant", autonome, solidaire et astucieux !',
        '🔗 <strong>SITE OFFICIEL :</strong> nird.forge.apps.education.fr, ressources, guides, témoignages et contact'
      ], 
      visited: false 
    },
  ]);

  visitedCount = computed(() => this.planets().filter((p: Planet) => p.visited).length);
  totalPlanets = computed(() => this.planets().length);

  ngOnInit() { this.startGameLoop(); }
  ngOnDestroy() { if (this.animationFrame) cancelAnimationFrame(this.animationFrame); }
  startGame() { this.gameStarted.set(true); this.isFlying.set(true); }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    // Si le chat est ouvert, on empêche tout mouvement, mais le composant Chat gère ses propres touches
    if (this.retroComputer && this.retroComputer.isChatOpen()) return;
    
    // Si le menu du portail est ouvert, le composant PortalMenu gère ses propres touches
    if (this.showPortalMenu()) return;
    
    // Si le jeu n'est pas lancé ou si une planète est ouverte
    if (!this.gameStarted() || this.showModal()) return;

    this.keys.add(event.key.toLowerCase());
    
    // INTERACTION AVEC ESPACE OU ENTREE
    if (event.key === ' ' || event.key === 'Enter') {
        this.checkInteractions();
    }
  }
  
  @HostListener('window:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent) { this.keys.delete(event.key.toLowerCase()); }

  private startGameLoop() {
    const gameLoop = () => {
      // Le jeu se fige visuellement (pas de mouvement) si le chat, le portail ou une modale est ouvert
      const isChatOpen = this.retroComputer && this.retroComputer.isChatOpen();
      
      if (this.gameStarted() && !this.showModal() && !isChatOpen && !this.showPortalMenu()) {
        this.updateRocketPosition();
      }
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
      const maxGravity = 0.7; 
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

  private checkInteractions() {
    const rocket = { x: this.rocketX(), y: this.rocketY() };
    
    // 1. Check Trou Noir EN PREMIER - Ouvre le menu portail dimensionnel
    // On utilise un rayon de 20 pour l'interaction menu
    const distToBlackHole = Math.sqrt(
      Math.pow(rocket.x - this.blackHole.x, 2) + 
      Math.pow(rocket.y - this.blackHole.y, 2)
    );
    if (distToBlackHole < 20) {
       this.keys.clear();
       this.openPortalMenu();
       return;
    }
    
    // 2. Check Planètes
    for (const planet of this.planets()) {
      const distance = Math.sqrt(Math.pow(rocket.x - planet.x, 2) + Math.pow(rocket.y - planet.y, 2));
      if (distance < 12) { 
          this.openPlanetInfo(planet); 
          return; 
      }
    }
    
    // 3. Check Computer - Appel Manuel
    // Si on est proche et qu'on appuie sur Espace, on ouvre le chat
    if (this.isNearComputer()) {
       this.keys.clear();
       this.retroComputer.openChat();
       return;
    }
    
    // 4. Check Card Talents - Navigation vers la page talents
    if (this.isNearCardTalents()) {
       this.keys.clear();
       this.cardTalents.navigateToTalents();
       return;
    }
    
    // 5. Check Retro Form - Navigation vers le formulaire
    if (this.isNearRetroForm()) {
       this.keys.clear();
       this.retroForm.navigateToForm();
       return;
    }
    
    // 6. Check Retro Media Player - Navigation vers le visualizer
    if (this.isNearMediaPlayer()) {
       this.keys.clear();
       this.retroMediaPlayer.navigateToVisualizer();
    }
  }

  openPlanetInfo(planet: Planet) {
    this.currentPlanet.set(planet);
    this.showModal.set(true);
    this.planets.update(planets => planets.map(p => p.id === planet.id ? { ...p, visited: true } : p));
    if (this.planets().filter(p => p.visited).length === this.totalPlanets()) {
      this.allVisited.set(true);
      this.showVictoryBanner.set(true);
    }
  }

  closeVictoryBanner() {
    this.showVictoryBanner.set(false);
  }

  closeModal() { this.showModal.set(false); this.currentPlanet.set(null); }
  onPlanetClick(planet: Planet) { if (this.gameStarted()) this.openPlanetInfo(planet); }
  
  isNearPlanet(planet: Planet): boolean {
    const rocket = { x: this.rocketX(), y: this.rocketY() };
    return Math.sqrt(Math.pow(rocket.x - planet.x, 2) + Math.pow(rocket.y - planet.y, 2)) < 12;
  }
  
  // --- GESTION DU MENU PORTAIL ---
  openPortalMenu() {
    this.showPortalMenu.set(true);
  }
  
  closePortalMenu() {
    this.showPortalMenu.set(false);
  }
  
  // Appelé depuis le menu portail quand on sélectionne "Chat Bruti"
  onOpenChatFromPortal() {
    if (this.retroComputer) {
      this.keys.clear();
      this.retroComputer.openChat();
    }
  }
}