import { Component, ElementRef, ViewChild, AfterViewInit, HostListener, signal, WritableSignal, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common'; // Nécessaire si non dans un module existant

// Déclaration factice pour que TypeScript accepte les références à THREE
declare const THREE: any;

// Interface pour les objets Univers
interface Universe {
  name: string;
  primary: string;
  secondary: string;
  bg: string;
  draw: (c: CanvasRenderingContext2D, w: number, h: number, isBg: boolean) => void;
  // Ajout des fonctions Three.js pour l'initialisation et le nettoyage
  init3D?: (container: HTMLCanvasElement, w: number, h: number) => void;
  dispose3D?: () => void;
  // Support pour les vidéos
  type?: '2d' | '3d' | 'video';
  videoElement?: HTMLVideoElement;
}

// Interface pour l'état du lecteur
interface PlayerState {
  isPlaying: boolean;
  isLoaded: boolean;
  statusText: string;
  currentUniverseIndex: number;
  progressValue: number;
  volume: number;
  isMuted: boolean;
  fileName: string;
  currentTimeDisplay: string;
  durationDisplay: string;
  primaryColor: string;       // Couleur d'accentuation principale
}

@Component({
  selector: 'app-retro-visualizer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './retro-visualizer.component.html',
  styleUrls: ['./retro-visualizer.component.css'],
  changeDetection: ChangeDetectionStrategy.Default,
  encapsulation: ViewEncapsulation.Emulated, // Isolation complète des styles
})
export class RetroVisualizerComponent implements AfterViewInit {
  // Références au DOM
  @ViewChild('audioElement') audioRef!: ElementRef<HTMLAudioElement>;
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('bgCanvas') bgCanvasRef!: ElementRef<HTMLCanvasElement>;

  // État de l'application (Signal)
  playerState: WritableSignal<PlayerState> = signal({
    isPlaying: false,
    isLoaded: false,
    statusText: 'INSERT TAPE',
    currentUniverseIndex: 0,
    progressValue: 0,
    volume: 1,
    isMuted: false,
    fileName: '',
    currentTimeDisplay: '00:00',
    durationDisplay: '00:00',
    primaryColor: '#ff007f',
  });

  // Propriété de survol pour l'interactivité 2D
  isHovering: boolean = false;

  // Propriétés Audio API
  private audioContext!: AudioContext;
  private analyser!: AnalyserNode;
  private ctx!: CanvasRenderingContext2D;
  private bgCtx!: CanvasRenderingContext2D;
  private dataArray!: Uint8Array<any>;
  private timeDataArray!: Uint8Array<any>;
  private bufferLength!: number;
  private animationFrameId: number | null = null;

  // Variables d'animation partagées
  private tick: number = 0;
  private bass: number = 0;
  private mids: number = 0;
  private treble: number = 0;
  private volume: number = 0;
  private smoothedData: number[] = [];
  private musicTime: number = 0; // Temps accumulé pour le shader 3D


  // Structure pour LAVA LAMP
  private lavaBlobs: { [key: string]: any[] } = {};
  private lavaLights: { [key: string]: any[] } = {};

  // Variables spécifiques à Three.js (initialisé comme dans chaos.html)
  private three: {
    renderer: any, scene: any, camera: any, clock: any, material: any, mesh: any,
    iResolution?: any, iMouse?: any, iBass?: any, iTime?: any, // Cybernetic Grid uniforms
    u_time?: any, u_resolution?: any, u_waveCount?: any, u_amplitude?: any, u_frequency?: any, u_brightness?: any, u_colorSeparation?: any, // Electric Waves uniforms
    u_bass?: any, u_mids?: any, u_treble?: any, uniforms?: any // Celestial uniforms
  } = {
    renderer: null,
    scene: null,
    camera: null,
    clock: typeof THREE !== 'undefined' ? new THREE.Clock() : null,
    material: null,
    mesh: null,
    uniforms: null
  };
  private mousePos = { x: 0, y: 0 };

  // Configuration des vidéos cinématographiques
  private videoConfig = [
    { name: "PINGUIN", file: "Danse_pinguin.mp4", color: "#ff0000" }
  ];

  // Définition des univers (sera complété avec les vidéos)
  private baseUniverses: Universe[] = [
    
    { name: "OUTRUN", primary: "#ff007f", secondary: "#00f3ff", bg: "#050011", draw: this.drawOutrun.bind(this) },
    { name: "LAVA LAMP", primary: "#ff2200", secondary: "#ffaa00", bg: "#110000", draw: this.drawLava.bind(this) },
    { name: "NEON BARS", primary: "#00f3ff", secondary: "#ff007f", bg: "#000000", draw: this.drawNeonBars.bind(this) },
    { name: "POLAR BLOB", primary: "#ff007f", secondary: "#00f3ff", bg: "#050011", draw: this.drawPolarBlob.bind(this) },
    { name: "TOXIC", primary: "#39ff14", secondary: "#f0f0f0", bg: "#001100", draw: this.drawToxic.bind(this) },
    { name: "COSMIC", primary: "#8a00ff", secondary: "#00aaff", bg: "#000510", draw: this.drawCosmic.bind(this) },
    { name: "OSCILLOSCOPE", primary: "#00ffff", secondary: "#ff00ff", bg: "#000000", draw: this.drawOscilloscope.bind(this) },
    {
      name: "CELESTIAL",
      primary: "#ff00ff",
      secondary: "#00ffff",
      bg: "#000515",
      draw: this.drawCelestial.bind(this),
      init3D: this.initCelestial.bind(this),
      dispose3D: this.disposeCelestial.bind(this)
    }
  ];

  // Univers complets (base + vidéos)
  readonly universes: Universe[] = this.initUniverses();

  get currentUniverse(): Universe {
    return this.universes[this.playerState().currentUniverseIndex];
  }

  // Initialisation des univers avec les vidéos (comme dans chaos.html)
  private initUniverses(): Universe[] {
    const list: Universe[] = [...this.baseUniverses];

    // Ajout des vidéos dynamiquement
    this.videoConfig.forEach(conf => {
      const vid = document.createElement('video');
      vid.src = `/${conf.file}`; // Chemin depuis public (servi à la racine)
      vid.loop = true;
      vid.muted = true;
      vid.preload = "auto";
      vid.playsInline = true; // Pour mobile

      list.push({
        name: "CINE: " + conf.name,
        primary: "#ffffff",
        secondary: conf.color,
        bg: "#000000",
        type: 'video',
        videoElement: vid,
        draw: (c, w, h, isBg) => this.drawVideoCinema(c, w, h, isBg, vid, conf.color)
      });
    });

    return list;
  }

  ngAfterViewInit(): void {
    // Initialisation des contextes Canvas
    this.ctx = this.canvasRef.nativeElement.getContext('2d')!;
    this.bgCtx = this.bgCanvasRef.nativeElement.getContext('2d')!;

    // Initialisation des couleurs et des tailles
    this.updateUniverseColors();
    this.resizeCanvas();

    const audioEl = this.audioRef.nativeElement;
    audioEl.volume = this.playerState().volume;

    // Écouteurs pour l'état du lecteur
    audioEl.addEventListener('play', () => {
      this.playerState.update(state => ({ ...state, isPlaying: true, statusText: 'RUNNING' }));
      // Lire la vidéo si c'est un univers vidéo
      const currentU = this.currentUniverse;
      if (currentU.type === 'video' && currentU.videoElement) {
        currentU.videoElement.play().catch(e => console.log("Chargement de la vidéo..."));
      }
      this.render();
    });

    audioEl.addEventListener('pause', () => {
      this.playerState.update(state => ({ ...state, isPlaying: false, statusText: 'PAUSED' }));
      // Pause la vidéo si c'est un univers vidéo
      const currentU = this.currentUniverse;
      if (currentU.type === 'video' && currentU.videoElement) {
        currentU.videoElement.pause();
      }
      this.stopDrawLoop();
    });

    audioEl.addEventListener('ended', () => {
      this.playerState.update(state => ({ ...state, isPlaying: false, statusText: 'INSERT TAPE', currentTimeDisplay: '00:00' }));
      this.stopDrawLoop();
    });

    // Écouteur pour la progression audio (appelé par (timeupdate) sur l'élément <audio>)
    this.audioRef.nativeElement.ontimeupdate = () => this.updateProgress();
    this.audioRef.nativeElement.onloadedmetadata = () => this.updateDuration();

    // Initialisation du premier univers
    const initialUniverse = this.currentUniverse;
    if (initialUniverse.init3D) {
      initialUniverse.init3D(this.canvasRef.nativeElement, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);
    }
  }

  // --- GESTION DE LA SOURIS POUR INTERACTION (Three.js) ---

  onCanvasMouseEnter() {
    this.isHovering = true;
    if (this.currentUniverse.name === "CYBERNETIC GRID" && this.three && this.three.iMouse) {
      this.canvasRef.nativeElement.addEventListener('mousemove', this.updateMousePos);
    }
  }

  onCanvasMouseLeave() {
    this.isHovering = false;
    if (this.three && this.three.iMouse) {
      this.canvasRef.nativeElement.removeEventListener('mousemove', this.updateMousePos);
      this.three.iMouse.value.set(-1000, -1000); // Déplacer la souris hors de l'écran
    }
  }

  private updateMousePos = (event: MouseEvent) => {
    if (this.three && this.three.iMouse) {
      const rect = this.canvasRef.nativeElement.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = rect.height - (event.clientY - rect.top); // Coordonnées Y inversées pour GLSL
      this.three.iMouse.value.set(x, y);
    }
  }
  // ----------------------------------------

  @HostListener('window:resize')
  onResize(): void {
    this.resizeCanvas();
    // Gérer le redimensionnement de Three.js
    if (this.three) {
      const w = this.canvasRef.nativeElement.width;
      const h = this.canvasRef.nativeElement.height;
      this.three.renderer.setSize(w, h);
      // Mise à jour de l'uniforme de résolution
      if (this.three.u_resolution) this.three.u_resolution.value.set(w, h);
      if (this.three.iResolution) this.three.iResolution.value.set(w, h);
      // Mise à jour pour CELESTIAL
      if (this.three.uniforms && this.three.uniforms.u_resolution) {
        this.three.uniforms.u_resolution.value.set(w, h);
      }
    }
    // Réinitialiser les blobs LAVA LAMP
    this.lavaBlobs = {};
    this.lavaLights = {};
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    this.mousePos.x = event.clientX;
    this.mousePos.y = event.clientY;
  }

  private resizeCanvas(): void {
    this.canvasRef.nativeElement.width = this.canvasRef.nativeElement.clientWidth;
    this.canvasRef.nativeElement.height = this.canvasRef.nativeElement.clientHeight;

    this.bgCanvasRef.nativeElement.width = window.innerWidth;
    this.bgCanvasRef.nativeElement.height = window.innerHeight;
  }

  /**
   * Met à jour les variables CSS globales pour le thème et la couleur primaire choisie.
   */
  private updateUniverseColors(): void {
    const u = this.currentUniverse;
    const p = this.playerState().primaryColor;
    const root = document.documentElement;

    root.style.setProperty('--primary', p); // Utilise la couleur choisie par l'utilisateur
    root.style.setProperty('--secondary', u.secondary);
    root.style.setProperty('--bg-color', u.bg);
  }

  /**
   * Formatte le temps en minutes:secondes (MM:SS).
   */
  private formatTime(seconds: number): string {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    const minStr = String(min).padStart(2, '0');
    const secStr = String(sec).padStart(2, '0');
    return `${minStr}:${secStr}`;
  }


  // --- LOGIQUE D'UNIVERS ---

  changeUniverse(): void {
    // 1. NETTOYAGE de l'ancien univers 3D si nécessaire
    if (this.currentUniverse.dispose3D) {
      this.currentUniverse.dispose3D();
      // Réinitialiser la structure three (comme dans chaos.html)
      this.three = {
        renderer: null,
        scene: null,
        camera: null,
        clock: typeof THREE !== 'undefined' ? new THREE.Clock() : null,
        material: null,
        mesh: null,
        uniforms: null
      };
    }

    // 2. Pause toutes les vidéos (comme dans chaos.html)
    this.universes.forEach(u => {
      if (u.type === 'video' && u.videoElement) {
        u.videoElement.pause();
      }
    });

    // 3. Nettoyer les blobs LAVA LAMP
    this.lavaBlobs = {};
    this.lavaLights = {};

    // 4. Changement d'index
    this.playerState.update(state => ({
      ...state,
      currentUniverseIndex: (state.currentUniverseIndex + 1) % this.universes.length,
    }));
    this.updateUniverseColors();

    // 5. INITIALISATION du nouvel univers 3D si nécessaire
    const newUniverse = this.currentUniverse;
    if (newUniverse.init3D) {
      // S'assurer que les écouteurs de souris sont déconnectés avant de rebrancher
      this.canvasRef.nativeElement.removeEventListener('mousemove', this.updateMousePos);

      newUniverse.init3D(this.canvasRef.nativeElement, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);

      // Réattacher si le nouvel univers en a besoin (ex: CYBERNETIC GRID)
      if (this.three && this.three.iMouse && this.isHovering) {
        this.canvasRef.nativeElement.addEventListener('mousemove', this.updateMousePos);
      }
    }

    // 6. Lire la vidéo si nécessaire (et si la musique est en cours)
    if (this.playerState().isPlaying && newUniverse.type === 'video' && newUniverse.videoElement) {
      newUniverse.videoElement.play().catch(e => console.log("Chargement de la vidéo..."));
    }

    // Assurer que le rendu est actif
    if (this.playerState().isPlaying || newUniverse.init3D || newUniverse.type === 'video') {
      this.render();
    }
  }

  /**
   * Gère le changement de couleur primaire par l'utilisateur.
   */
  setPrimaryColor(event: Event): void {
    const input = event.target as HTMLInputElement;
    const newColor = input.value;
    this.playerState.update(state => ({ ...state, primaryColor: newColor }));
    this.updateUniverseColors();

    // Mettre à jour l'uniforme de couleur si le mode 3D est actif
    if (this.three && this.three.material) {
      if (this.three.material.uniforms.primaryColor) {
        this.three.material.uniforms.primaryColor.value.set(newColor);
      }
    }
  }

  // --- LOGIQUE AUDIO ---

  private initAudioEngine(): void {
    if (this.audioContext) return;

    this.audioContext = new AudioContext ();
    this.analyser = this.audioContext.createAnalyser();

    const sourceNode = this.audioContext.createMediaElementSource(this.audioRef.nativeElement);
    sourceNode.connect(this.analyser);
    this.analyser.connect(this.audioContext.destination);

    this.analyser.fftSize = 2048; // Augmenté pour la haute résolution (Oscilloscope)
    this.bufferLength = this.analyser.frequencyBinCount; // 1024 points pour la fréquence

    this.timeDataArray = new Uint8Array(this.analyser.fftSize);
    this.dataArray = new Uint8Array(this.bufferLength);
    this.smoothedData = new Array(this.bufferLength).fill(0);

    this.playerState.update(state => ({ ...state, statusText: 'PRÊT' }));
  }

  handleFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.audioRef.nativeElement.src = URL.createObjectURL(file);
      this.audioRef.nativeElement.load();

      this.playerState.update(state => ({ ...state, isLoaded: true, fileName: file.name }));
      this.initAudioEngine();
      this.audioRef.nativeElement.play().catch(e => console.error("Erreur de lecture:", e));
    }
  }

  togglePlayPause(): void {
    if (!this.playerState().isLoaded) return;

    const currentU = this.currentUniverse;

    if (this.playerState().isPlaying) {
      this.audioRef.nativeElement.pause();
      // Pause la vidéo si c'est un univers vidéo
      if (currentU.type === 'video' && currentU.videoElement) {
        currentU.videoElement.pause();
      }
    } else {
      if (this.audioContext && this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }
      this.audioRef.nativeElement.play().catch(e => console.error("Erreur de lecture:", e));
      // Lire la vidéo si c'est un univers vidéo
      if (currentU.type === 'video' && currentU.videoElement) {
        currentU.videoElement.play().catch(e => console.log("Chargement de la vidéo..."));
      }
    }
  }

  toggleMute(): void {
    const isMuted = !this.playerState().isMuted;
    this.audioRef.nativeElement.muted = isMuted;
    this.playerState.update(state => ({ ...state, isMuted: isMuted }));
  }

  /** Met à jour l'affichage du temps et la barre de progression. */
  updateProgress(): void {
    const audio = this.audioRef.nativeElement;
    if (audio.duration) {
      this.playerState.update(state => ({
        ...state,
        progressValue: (audio.currentTime / audio.duration) * 100,
        currentTimeDisplay: this.formatTime(audio.currentTime)
      }));
    }
  }

  /** Met à jour la durée totale après le chargement du média. */
  updateDuration(): void {
    this.playerState.update(state => ({
      ...state,
      durationDisplay: this.formatTime(this.audioRef.nativeElement.duration)
    }));
  }


  seek(event: Event): void {
    const input = event.target as HTMLInputElement;
    const audio = this.audioRef.nativeElement;
    const seekTime = (parseFloat(input.value) / 100) * audio.duration;
    audio.currentTime = seekTime;
  }

  setVolume(event: Event): void {
    const input = event.target as HTMLInputElement;
    const volume = parseFloat(input.value);
    this.audioRef.nativeElement.volume = volume;
    this.playerState.update(state => ({ ...state, volume }));
  }

  private stopDrawLoop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  // --- BOUCLE DE RENDU PRINCIPALE (méthode render) ---

  private render = (): void => {

    if (!this.playerState().isPlaying && !this.three) return;

    this.animationFrameId = requestAnimationFrame(this.render);

    this.analyser.getByteFrequencyData(this.dataArray as any);
    this.analyser.getByteTimeDomainData(this.timeDataArray as any);

    // Analyse Audio complète
    let tempBass = 0;
    let tempMids = 0;
    let tempTreble = 0;
    let tempVol = 0;

    for(let i=0; i<this.dataArray.length; i++) {
      // Lissage
      this.smoothedData[i] += (this.dataArray[i] - this.smoothedData[i]) * 0.3;
      tempVol += this.dataArray[i];

      // BASSES (0-5) : Kick / Basse
      if (i < 5) tempBass += this.dataArray[i];

      // MÉDIUMS (10-50) : Voix et Guitare
      if (i > 10 && i < 50) tempMids += this.dataArray[i];
      
      // AIGUS (60+) : Cymbales / Détails
      if (i > 60) tempTreble += this.dataArray[i];
    }

    // Calcul des moyennes
    this.bass = tempBass / 5;
    this.mids = tempMids / 40;
    this.treble = tempTreble / (this.dataArray.length - 60);
    this.volume = tempVol / this.dataArray.length;

    this.tick++;

    // Logique 2D Canvas (y compris pour CELESTIAL qui utilise drawThreeJSScene)
    const currentDraw = this.currentUniverse.draw;

    currentDraw(this.ctx, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height, false);
    currentDraw(this.bgCtx, this.bgCanvasRef.nativeElement.width, this.bgCanvasRef.nativeElement.height, true);
  }

  // ==========================================================
  // === UNIVERS 10 : CYBERNETIC GRID (THREE.JS) - NOUVEAU ===
  // ==========================================================

  initCyberneticGrid(container: HTMLCanvasElement, w: number, h: number): void {
    if (typeof THREE === 'undefined') return;

    if (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    // Configurer le canvas pour que le rendu 3D remplace le 2D
    container.style.position = 'relative';

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(w, h);

    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const clock = new THREE.Clock();

    const vertexShader = `
      void main() {
        gl_Position = vec4(position, 1.0);
      }
    `;

    // Fragment Shader: Grille de perspective Rétro (Tunnel Warp)
    const fragmentShader = `
      precision mediump float;
      uniform float iTime;
      uniform vec2 iResolution;
      uniform vec2 iMouse;
      uniform float iBass; // Basse normalisée (0.0 - 1.0)
      uniform vec3 primaryColor;
      uniform vec3 secondaryColor;

      // Fonctions utilitaires
      float hash(vec2 p) {
          return fract(sin(dot(p, vec2(41.41, 28.28))) * 42000.0);
      }

      void main() {
          vec2 uv = (gl_FragCoord.xy - 0.5 * iResolution.xy) / iResolution.y;
          vec2 p = uv;

          // Paramètres
          float speed = iTime * 0.1 * (1.0 + iBass * 0.5); // Vitesse influencée par la basse
          float aspect = iResolution.x / iResolution.y;

          // Déformation et effet tunnel
          p.x *= aspect; // Correction ratio

          float a = atan(p.y, p.x); // Angle (0 to 2*PI)
          float r = length(p); // Rayon (distance au centre)

          // Perspective tunnel (Logarithme)
          r = log(r + 0.1);

          // Rotation et distorsion
          a += speed * 0.3;
          r += sin(a * 4.0 + speed * 0.5) * 0.05 * iBass; // La basse déforme la grille

          // Mapping pour la grille
          vec2 grid = vec2(a * 5.0, r * 20.0);

          // Répétition
          grid.x = fract(grid.x);
          grid.y = fract(grid.y);

          // Grille (créer les lignes)
          float gridX = smoothstep(0.01, 0.02, grid.x) - smoothstep(0.98, 0.99, grid.x);
          float gridY = smoothstep(0.01, 0.02, grid.y) - smoothstep(0.98, 0.99, grid.y);

          float lines = max(gridX, gridY);

          // Couleurs
          // L'intensité est plus forte près des lignes et est amplifiée par les lignes
          vec3 lineCol = primaryColor * (0.5 + 0.5 * lines);

          // Lueur centrale (utilise la basse)
          float glow = pow(lines, 3.0) * (1.0 + iBass * 2.0);

          vec3 finalColor = lineCol * glow;

          // Scanline/CRT effect
          float scanline = sin(gl_FragCoord.y * 3.0) * 0.05 + 0.95;
          finalColor *= scanline;

          // Vignette
          float vignette = 1.0 - length(uv) * 0.3;
          finalColor *= vignette;


          gl_FragColor = vec4(finalColor, 1.0);
      }
    `;

    // Valeurs initiales pour les uniformes
    const uniforms = {
      iTime: { value: 0 },
      iResolution: { value: new THREE.Vector2(w, h) },
      iMouse: { value: new THREE.Vector2(-1000, -1000) }, // Initialiser hors écran
      iBass: { value: 0.1 },
      primaryColor: { value: new THREE.Color(this.playerState().primaryColor) },
      secondaryColor: { value: new THREE.Color(this.currentUniverse.secondary) }
    };

    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Stocker les références des uniformes pertinents
    this.three = {
      renderer, scene, camera, clock, material, mesh,
      iTime: uniforms.iTime,
      iResolution: uniforms.iResolution,
      iMouse: uniforms.iMouse,
      iBass: uniforms.iBass,
    };
  }

  // Fonction de nettoyage de Three.js
  disposeCyberneticGrid(): void {
    // Déconnecter l'écouteur de souris
    this.canvasRef.nativeElement.removeEventListener('mousemove', this.updateMousePos);

    if (this.three) {
      if (this.three.renderer.domElement.parentElement) {
        this.three.renderer.domElement.parentElement.removeChild(this.three.renderer.domElement);
      }
      this.three.renderer.dispose();
      this.three.material.dispose();
      // Réinitialiser la structure
      this.three.renderer = null;
      this.three.scene = null;
      this.three.camera = null;
      this.three.material = null;
      this.three.mesh = null;
    }
  }

  // Fonction de dessin (Placeholder pour le système 2D)
  drawCyberneticGrid(c: CanvasRenderingContext2D, w: number, h: number, isBg: boolean): void {
    if (this.three) {
      c.clearRect(0, 0, w, h);
      // Nous laissons le rendu 3D gérer le canvas
    }
  }

  // ==========================================================
  // === UNIVERS 0 : CELESTIAL (THREE.JS) ===
  // ==========================================================

  initCelestial(container: HTMLCanvasElement, w: number, h: number): void {
    if (typeof THREE === 'undefined') return;
    // Initialiser Three.js comme dans chaos.html (appelé depuis switchUniverse)
    this.initThreeJS(w, h);
  }

  // Initialisation Three.js de base (comme initThreeJS dans chaos.html)
  private initThreeJS(w: number, h: number): void {
    // Vérification que Three.js est chargé
    if (typeof THREE === 'undefined') {
      console.error('❌ Three.js n\'est pas chargé ! Vérifiez que le script est inclus dans index.html');
      return;
    }
    console.log('✅ Three.js est chargé:', typeof THREE, THREE);

    if (!this.three) {
      this.three = {
        renderer: null,
        scene: null,
        camera: null,
        clock: new THREE.Clock(),
        material: null,
        mesh: null,
        uniforms: null
      };
    }

    if (!this.three.renderer) {
      try {
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(w, h);
        renderer.setPixelRatio(window.devicePixelRatio);
        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        
        this.three.renderer = renderer;
        this.three.scene = scene;
        this.three.camera = camera;
        
        console.log('✅ Three.js renderer initialisé:', {
          renderer: !!renderer,
          scene: !!scene,
          camera: !!camera,
          canvasSize: { w, h }
        });
      } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation de Three.js:', error);
      }
    }
  }

  // Fonction adaptée de chaos.html pour dessiner la scène Three.js
  private drawThreeJSScene(c: CanvasRenderingContext2D, w: number, h: number, isBg: boolean, shaderType: string): void {
    // Initialiser Three.js si nécessaire (comme dans chaos.html)
    if (!this.three || !this.three.renderer) {
      this.initThreeJS(w, h);
    }

    if (!this.three || !this.three.renderer) {
      console.warn('⚠️ Three.js renderer non disponible');
      return;
    }

    const sys = this.three;

    // Vérifier et mettre à jour la taille si nécessaire (comme dans chaos.html)
    if (sys.renderer.domElement.width !== w || sys.renderer.domElement.height !== h) {
      sys.renderer.setSize(w, h);
      if (sys.uniforms) {
        sys.uniforms.u_resolution.value.set(w, h);
      }
    }

    // Vérifier si le matériau doit être recréé
    const currentMaterialType = sys.mesh ? (sys.mesh as any).name : null;
    if (currentMaterialType !== shaderType) {
      if (sys.mesh) {
        sys.scene.remove(sys.mesh);
        if (sys.material) {
          sys.material.dispose();
        }
      }

      const vert = `varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position, 1.0); }`;
      const frag = `
        precision mediump float;
        uniform float u_time;
        uniform vec2 u_resolution;
        uniform float u_bass;
        uniform float u_mids;
        uniform float u_treble;
        
        vec3 drawWaveLayer(vec2 uv, vec3 color, float freqBase, float ampBase, float thicknessBase, float speed, float intensityInput) {
          float intensity = 0.0;
          for (float i = 0.0; i < 4.0; i++) {
            float f = freqBase + (i * 0.5);
            float t = u_time * speed + (i * 0.3);
            float wave = sin(uv.y * f + t);
            float x = uv.x + wave * ampBase;
            float th = thicknessBase + (intensityInput * 0.015);
            intensity += th / (abs(x) + 0.03);
          }
          intensity *= (1.0 - abs(uv.y));
          return color * intensity * (intensityInput * intensityInput); 
        }

        void main() {
          vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);
          float angle = u_time * 0.1; 
          mat2 rot = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
          vec2 rotatedUv = rot * uv;
          vec3 finalColor = vec3(0.0);

          vec3 colBass = vec3(0.05, 0.2, 0.8); 
          float bassInput = u_bass * 2.5;
          if(bassInput > 0.1) {
            finalColor += drawWaveLayer(rotatedUv, colBass, 6.0, 0.15, 0.002, 1.5, bassInput);
          }

          vec3 colMids = vec3(0.6, 0.0, 0.8); 
          float midsInput = u_mids * 2.0;
          if(midsInput > 0.1) {
            vec2 midUv = rotatedUv + vec2(0.5, 0.0);
            finalColor += drawWaveLayer(midUv, colMids, 2.0, 0.4, 0.001, 0.5, midsInput);
          }

          vec3 colTreble = vec3(0.0, 0.7, 0.5); 
          float trebleInput = u_treble * 1.5;
          if(trebleInput > 0.1) {
            vec2 trebleUv = rotatedUv - vec2(0.5, 0.0);
            finalColor += drawWaveLayer(trebleUv, colTreble, 10.0, 0.05, 0.001, 0.8, trebleInput);
          }

          finalColor *= 0.8;
          float flash = smoothstep(0.85, 1.5, u_bass);
          finalColor += vec3(0.4, 0.6, 1.0) * flash * 0.25;
          float smoothness = 1.4 - ((u_bass + u_mids) * 0.3);
          finalColor = pow(finalColor, vec3(max(0.9, smoothness)));
          finalColor *= 0.8 + 0.2 * sin(gl_FragCoord.y * 12.0);

          gl_FragColor = vec4(finalColor, 1.0);
        }
      `;

      const material = new THREE.ShaderMaterial({
        uniforms: {
          u_time: { value: 0 },
          u_resolution: { value: new THREE.Vector2(w, h) },
          u_bass: { value: 0 },
          u_mids: { value: 0 },
          u_treble: { value: 0 }
        },
        vertexShader: vert,
        fragmentShader: frag,
        blending: THREE.AdditiveBlending,
        transparent: true
      });

      const geometry = new THREE.PlaneGeometry(2, 2);
      sys.mesh = new THREE.Mesh(geometry, material);
      (sys.mesh as any).name = shaderType;
      sys.scene.add(sys.mesh);
      sys.material = material;
      sys.uniforms = material.uniforms;
    }

    // Mise à jour des uniformes
    if (sys.uniforms) {
      let speed = 0.2 + (this.volume / 60);
      this.musicTime += 0.01 * speed;
      sys.uniforms.u_time.value = this.musicTime;

      // BASSES
      let b = (this.bass / 255);
      if (b < 0.3) b = 0;
      let targetBass = b * 1.5;
      sys.uniforms.u_bass.value += (targetBass - sys.uniforms.u_bass.value) * 0.4;

      // MIDS
      let m = (this.mids / 255);
      let targetMids = m * 2.0;
      sys.uniforms.u_mids.value += (targetMids - sys.uniforms.u_mids.value) * 0.1;

      // AIGUS
      let t = (this.treble / 255);
      sys.uniforms.u_treble.value += (t - sys.uniforms.u_treble.value) * 0.2;
    }

    // Rendu Three.js
    try {
      sys.renderer.render(sys.scene, sys.camera);
      
      // Dessiner sur le canvas 2D
      c.drawImage(sys.renderer.domElement, 0, 0, w, h);
    } catch (error) {
      console.error('❌ Erreur lors du rendu Three.js:', error);
      // Dessiner un fond de secours
      c.fillStyle = '#000515';
      c.fillRect(0, 0, w, h);
    }

    // Scanlines
    c.globalCompositeOperation = 'source-over';
    c.fillStyle = "rgba(0, 0, 0, 0.35)";
    for (let i = 0; i < h; i += 4) {
      c.fillRect(0, i, w, 1);
    }
  }

  disposeCelestial(): void {
    // Nettoyer le mesh et le matériau
    if (this.three.mesh && this.three.scene) {
      this.three.scene.remove(this.three.mesh);
    }
    if (this.three.material) {
      this.three.material.dispose();
    }
    // Le canvas Three.js n'est pas dans le DOM, donc on le nettoie directement
    if (this.three.renderer) {
      this.three.renderer.dispose();
    }
    // Réinitialiser la structure (comme dans chaos.html)
    this.three.renderer = null;
    this.three.scene = null;
    this.three.camera = null;
    this.three.material = null;
    this.three.mesh = null;
    this.three.uniforms = null;
    this.musicTime = 0; // Réinitialiser le temps
  }

  drawCelestial(c: CanvasRenderingContext2D, w: number, h: number, isBg: boolean): void {
    // Nettoyer le canvas avant de dessiner
    c.clearRect(0, 0, w, h);
    
    // Utiliser la fonction drawThreeJSScene adaptée de chaos.html
    this.drawThreeJSScene(c, w, h, isBg, 'bloom');
  }

  // ==========================================================
  // === UNIVERS 1 : OUTRUN ===
  // ==========================================================

  private drawOutrun(c: CanvasRenderingContext2D, w: number, h: number, isBg: boolean): void {
    const horizon = h * 0.5;
    const cx = w / 2;

    // CIEL
    c.globalCompositeOperation = 'source-over';
    const skyGrad = c.createLinearGradient(0, 0, 0, horizon);
    skyGrad.addColorStop(0, "#050011");
    skyGrad.addColorStop(1, "#2a0033");
    c.fillStyle = skyGrad;
    c.fillRect(0, 0, w, horizon);

    // SOLEIL
    c.save();
    c.shadowBlur = isBg ? 80 : 40;
    c.shadowColor = "#ff0055";
    const sunSize = isBg ? h * 0.25 : h * 0.2;
    const sunPulse = (this.bass / 255) * 15;
    const sunGrad = c.createLinearGradient(0, horizon - sunSize, 0, horizon + sunSize);
    sunGrad.addColorStop(0, "#ffaa00");
    sunGrad.addColorStop(0.5, "#ff0055");
    sunGrad.addColorStop(1, "#800080");
    c.fillStyle = sunGrad;
    c.beginPath();
    c.arc(cx, horizon - (sunSize * 0.3), sunSize + sunPulse, 0, Math.PI * 2);
    c.fill();
    c.restore();

    // MONTAGNES
    c.globalCompositeOperation = 'lighter';
    const drawMountainLayer = (color: string, dataOffset: number, ampMultiplier: number, widthSpread: number) => {
      c.shadowBlur = isBg ? 20 : 10;
      c.shadowColor = color;
      c.fillStyle = color;
      c.beginPath();
      c.moveTo(0, horizon);
      const step = w / 60;
      for(let i = 0; i <= 60; i++) {
        let dataIndex = Math.floor(i * widthSpread) + dataOffset;
        if (dataIndex >= this.smoothedData.length) dataIndex = this.smoothedData.length - 1;
        const val = this.smoothedData[dataIndex] || 0;
        const mountainHeight = val * ampMultiplier * (isBg ? 1.5 : 0.8);
        const centerFade = 1 - Math.pow(Math.abs((i * step - cx) / (w/2)), 2);
        const y = horizon - (mountainHeight * centerFade);
        c.lineTo(i * step, y);
      }
      c.lineTo(w, horizon);
      c.fill();
    };

    drawMountainLayer("rgba(80, 0, 180, 0.5)", 0, 1.4, 0.5);
    drawMountainLayer("rgba(0, 200, 255, 0.4)", 10, 1.0, 0.8);
    drawMountainLayer("rgba(255, 50, 0, 0.6)", 30, 0.7, 1.2);

    // SOL
    c.globalCompositeOperation = 'source-over';
    const groundGrad = c.createLinearGradient(0, horizon, 0, h);
    groundGrad.addColorStop(0, "#150020");
    groundGrad.addColorStop(1, "#0a0010");
    c.fillStyle = groundGrad;
    c.fillRect(0, horizon, w, h - horizon);

    // GRILLE
    c.strokeStyle = "rgba(255, 0, 127, 0.5)";
    c.shadowBlur = 5;
    c.shadowColor = "#ff007f";
    c.lineWidth = 2;
    c.beginPath();
    for(let i = -w; i < w * 2; i += w / 10) {
      c.moveTo(cx, horizon);
      c.lineTo(i, h);
    }
    const speed = (this.tick * 3) % 100;
    for(let i = 0; i < 20; i++) {
      let z = 100 + i * 50 - speed;
      if (z < 10) z += 1000;
      const p = 400 / z;
      const y = horizon + (p * h * 0.5);
      if(y >= horizon && y < h) {
        c.moveTo(0, y);
        c.lineTo(w, y);
      }
    }
    c.stroke();
  }

  // ==========================================================
  // === UNIVERS 2 : LAVA LAMP ===
  // ==========================================================

  private drawLava(c: CanvasRenderingContext2D, w: number, h: number, isBg: boolean): void {
    const contextId = isBg ? 'bg' : 'fg';
    
    // INITIALISATION
    if (!this.lavaBlobs[contextId]) this.lavaBlobs[contextId] = [];
    if (!this.lavaLights[contextId]) this.lavaLights[contextId] = [];

    const blobs = this.lavaBlobs[contextId];
    const lights = this.lavaLights[contextId];
    const numBlobs = isBg ? 12 : 8;
    const numLights = isBg ? 50 : 30;

    if (blobs.length < numBlobs) {
      for (let i = blobs.length; i < numBlobs; i++) {
        blobs.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vy: (Math.random() * 0.4 + 0.1) * (Math.random() > 0.5 ? 1 : -1),
          vx: (Math.random() - 0.5) * 0.3,
          radius: (isBg ? 80 : 25) + Math.random() * (isBg ? 120 : 40),
          colorHue: Math.random() * 30
        });
      }
    }

    if (lights.length < numLights) {
      for (let i = lights.length; i < numLights; i++) {
        lights.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vy: 0.5 + Math.random(),
          radius: 1 + Math.random() * 2,
          offset: Math.random() * 100
        });
      }
    }

    // FOND
    c.globalCompositeOperation = 'source-over';
    const bgGrad = c.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, "#0f0000");
    bgGrad.addColorStop(1, "#2a0000");
    c.fillStyle = bgGrad;
    c.fillRect(0, 0, w, h);

    // LUMIÈRES
    c.globalCompositeOperation = 'lighter';
    const intensity = this.bass / 255;
    const threshold = 0.35;

    lights.forEach(light => {
      light.y -= light.vy * (1 + (intensity > threshold ? intensity * 3 : 0));
      if (light.y < -10) {
        light.y = h + 10;
        light.x = Math.random() * w;
      }

      let alpha = 0;
      let radiusMultiplier = 1;

      if (intensity < threshold) {
        const breath = Math.sin(this.tick * 0.05 + light.offset);
        alpha = 0.2 + (breath * 0.1);
        radiusMultiplier = 1;
      } else {
        const excess = intensity - threshold;
        const strobe = Math.random();
        alpha = 0.2 + (excess * strobe * 4.0);
        radiusMultiplier = 1 + (excess * strobe * 5.0);
      }

      if (alpha > 1) alpha = 1;
      if (alpha < 0) alpha = 0;

      const r = light.radius * radiusMultiplier;
      if (intensity > 0.8 && Math.random() > 0.5) {
        c.fillStyle = `rgba(255, 255, 200, ${alpha})`;
      } else {
        c.fillStyle = `rgba(255, 200, 50, ${alpha})`;
      }

      c.beginPath();
      c.arc(light.x, light.y, r, 0, Math.PI * 2);
      c.fill();
    });

    // BLOBS
    c.globalCompositeOperation = 'lighter';
    let localMouseX = this.mousePos.x;
    let localMouseY = this.mousePos.y;
    if (!isBg) {
      const rect = this.canvasRef.nativeElement.getBoundingClientRect();
      localMouseX = (this.mousePos.x - rect.left) * (this.canvasRef.nativeElement.width / rect.width);
      localMouseY = (this.mousePos.y - rect.top) * (this.canvasRef.nativeElement.height / rect.height);
    }

    blobs.forEach(blob => {
      blob.y -= blob.vy * (1 + this.bass / 250);
      blob.x += blob.vx * (1 + this.bass / 400);
      
      const dx = blob.x - localMouseX;
      const dy = blob.y - localMouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < (isBg ? 300 : 100)) {
        const force = ((isBg ? 300 : 100) - dist) / (isBg ? 300 : 100);
        blob.x += (dx / dist) * force * (isBg ? 8 : 4);
        blob.y += (dy / dist) * force * (isBg ? 8 : 4);
      }

      if (blob.y > h + blob.radius) blob.y = -blob.radius;
      if (blob.y < -blob.radius) blob.y = h + blob.radius;
      if (blob.x > w + blob.radius) blob.x = -blob.radius;
      if (blob.x < -blob.radius) blob.x = w + blob.radius;
      
      const grad = c.createRadialGradient(blob.x, blob.y, 0, blob.x, blob.y, blob.radius);
      const hue = blob.colorHue + (this.bass / 20);
      grad.addColorStop(0, `hsla(${hue}, 100%, 50%, 1)`);
      grad.addColorStop(0.7, `hsla(${hue + 10}, 100%, 40%, 0.5)`);
      grad.addColorStop(1, "rgba(0,0,0,0)");
      c.fillStyle = grad;
      c.beginPath();
      c.arc(blob.x, blob.y, blob.radius, 0, Math.PI * 2);
      c.fill();
    });
  }

  // ==========================================================
  // === UNIVERS 1 : NEON BARS ===
  // ==========================================================
  private drawNeonBars(c: CanvasRenderingContext2D, w: number, h: number, isBg: boolean): void {
    c.globalCompositeOperation = 'source-over';
    c.fillStyle = isBg ? 'rgba(0, 0, 0, 0.08)' : 'rgba(0, 0, 0, 0.1)';
    c.fillRect(0, 0, w, h);

    c.globalCompositeOperation = 'lighter';
    c.shadowBlur = isBg ? 20 : 10;

    let totalBars = isBg ? 80 : 64;
    const barWidth = (w / totalBars) * 0.8;
    const gap = (w / totalBars) * 0.2;
    let x = gap / 2;

    for (let i = 0; i < totalBars; i++) {
      const index = Math.floor(i * (this.bufferLength / totalBars));
      const amplitude = this.smoothedData[index] || 0;
      const barHeight = amplitude * (isBg ? 2.5 : 1.5);

      const hue = 300 - (amplitude / 255) * 60;
      const color = `hsl(${hue}, 100%, 50%)`;

      c.fillStyle = color;
      c.shadowColor = color;

      const y = h / 2;
      c.fillRect(x, y - barHeight / 2, barWidth, barHeight);

      x += barWidth + gap;
    }

    c.shadowBlur = 0;
    c.shadowColor = 'transparent';
  }


  // ==========================================================
  // === UNIVERS 2 : POLAR BLOB ===
  // ==========================================================
  private drawPolarBlob(c: CanvasRenderingContext2D, w: number, h: number, isBg: boolean): void {
    c.globalCompositeOperation = 'source-over';

    c.fillStyle = isBg ? 'rgba(5, 0, 17, 1.0)' : 'rgba(17, 24, 39, 1.0)';
    c.fillRect(0, 0, w, h);

    if (!this.analyser) return;

    const centerX = w / 2;
    const centerY = h / 2;
    const baseRadius = h * (isBg ? 0.05 : 0.15);

    let totalEnergy = this.dataArray.reduce((acc, val) => acc + val, 0);
    const averageEnergy = totalEnergy / this.bufferLength;

    const hue = 320 + (averageEnergy * 0.8) + (this.tick * 0.1);
    const saturation = 100;
    const lightness = 60;
    const color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    const strokeColor = `hsl(${hue + 40}, 90%, ${lightness - 10}%)`;

    c.globalCompositeOperation = 'lighter';
    c.fillStyle = color;
    c.strokeStyle = strokeColor;
    c.lineWidth = isBg ? 1 : 3;
    c.shadowColor = strokeColor;
    c.shadowBlur = isBg ? 50 : 15;

    c.beginPath();

    for (let i = 0; i < this.bufferLength; i++) {
      const amplitude = this.dataArray[i];
      const maxExpansion = h * (isBg ? 0.8 : 0.4);
      const radius = baseRadius + (amplitude / 255) * maxExpansion;

      const angle = (i / this.bufferLength) * 2 * Math.PI;

      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      if (i === 0) {
        c.moveTo(x, y);
      } else {
        c.lineTo(x, y);
      }
    }

    c.closePath();
    c.fill();
    c.stroke();

    c.shadowBlur = 0;
    c.shadowColor = 'transparent';
  }

  // ==========================================================
  // === UNIVERS 11 : TOXIC ===
  // ==========================================================
  private drawToxic(c: CanvasRenderingContext2D, w: number, h: number, isBg: boolean): void {
    c.globalCompositeOperation = 'source-over';
    c.fillStyle = "rgba(0, 10, 0, 0.3)";
    c.fillRect(0, 0, w, h);

    c.globalCompositeOperation = 'lighter';
    c.shadowBlur = isBg ? 15 : 5;
    c.shadowColor = "#39ff14";
    c.fillStyle = "#39ff14";

    const bars = 40;
    const step = w / bars;
    const shakeX = (this.bass > 200) ? (Math.random() - 0.5) * 10 : 0;

    for (let i = 0; i < bars; i++) {
      const val = this.smoothedData[i * 2] || 0;
      const barH = val * (isBg ? 2 : 1);
      c.fillRect(i * step + 2 + shakeX, h / 2 - barH, step - 4, barH * 2);
    }

    c.strokeStyle = "rgba(255, 255, 255, 0.5)";
    c.beginPath();
    c.moveTo(0, h / 2 + Math.sin(this.tick * 0.1) * h / 2);
    c.lineTo(w, h / 2 + Math.sin(this.tick * 0.1) * h / 2);
    c.stroke();
  }

  // ==========================================================
  // === UNIVERS 12 : COSMIC ===
  // ==========================================================
  private drawCosmic(c: CanvasRenderingContext2D, w: number, h: number, isBg: boolean): void {
    c.globalCompositeOperation = 'source-over';
    c.fillStyle = "rgba(0, 5, 20, 0.1)";
    c.fillRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2;

    c.globalCompositeOperation = 'lighter';
    c.shadowBlur = isBg ? 50 : 20;
    c.shadowColor = "#8a00ff";
    c.strokeStyle = "#00aaff";
    c.lineWidth = isBg ? 4 : 2;

    c.beginPath();
    const radius = isBg ? h * 0.3 : h * 0.2;
    for (let i = 0; i <= 60; i++) {
      const angle = (i / 60) * Math.PI * 2;
      const val = this.smoothedData[i % 40];
      const r = radius + (val * (isBg ? 1.5 : 0.6));
      const rot = this.tick * 0.01;
      const x = cx + Math.cos(angle + rot) * r;
      const y = cy + Math.sin(angle + rot) * r;
      if (i === 0) c.moveTo(x, y);
      else c.lineTo(x, y);
    }
    c.closePath();
    c.stroke();
  }

  // ==========================================================
  // === UNIVERS : OSCILLOSCOPE ===
  // ==========================================================
  private drawOscilloscope(c: CanvasRenderingContext2D, w: number, h: number, isBg: boolean): void {
    c.globalCompositeOperation = 'source-over';
    
    // Fond sombre avec fade pour l'effet de traînée
    c.fillStyle = isBg ? "rgba(0, 0, 0, 0.1)" : "rgba(0, 0, 0, 0.3)";
    c.fillRect(0, 0, w, h);

    if (!this.analyser || !this.timeDataArray) return;

    // Obtenir les données temporelles (forme d'onde)
    this.analyser.getByteTimeDomainData(this.timeDataArray as any);

    const centerY = h / 2;
    const sliceWidth = w / this.timeDataArray.length;
    
    c.globalCompositeOperation = 'lighter';
    c.strokeStyle = isBg ? "rgba(0, 255, 255, 0.3)" : "#00ffff";
    c.lineWidth = isBg ? 1 : 2;
    c.shadowBlur = isBg ? 20 : 10;
    c.shadowColor = "#00ffff";

    c.beginPath();

    let x = 0;
    for (let i = 0; i < this.timeDataArray.length; i++) {
      // Convertir la valeur (0-255) en amplitude (-1 à 1)
      const v = (this.timeDataArray[i] / 128.0) - 1.0;
      const y = centerY + (v * (isBg ? h * 0.3 : h * 0.4));

      if (i === 0) {
        c.moveTo(x, y);
      } else {
        c.lineTo(x, y);
      }

      x += sliceWidth;
    }

    c.stroke();

    // Ligne centrale (grille)
    c.globalCompositeOperation = 'source-over';
    c.strokeStyle = "rgba(0, 255, 255, 0.2)";
    c.lineWidth = 1;
    c.shadowBlur = 0;
    c.beginPath();
    c.moveTo(0, centerY);
    c.lineTo(w, centerY);
    c.stroke();

    // Grille verticale discrète
    c.strokeStyle = "rgba(0, 255, 255, 0.1)";
    for (let i = 0; i < 10; i++) {
      c.beginPath();
      c.moveTo((w / 10) * i, 0);
      c.lineTo((w / 10) * i, h);
      c.stroke();
    }
  }

  // ==========================================================
  // === UNIVERS VIDÉO : CINÉMA (GLITCH) ===
  // ==========================================================

  private drawVideoCinema(c: CanvasRenderingContext2D, w: number, h: number, isBg: boolean, vidElement: HTMLVideoElement, flashColor: string): void {
    c.globalCompositeOperation = 'source-over';

    // Sécurité si la vidéo n'est pas chargée
    if (!vidElement || vidElement.readyState < 2) {
      c.fillStyle = Math.random() > 0.5 ? "#111" : "#000";
      c.fillRect(0, 0, w, h);
      return;
    }

    // 1. GESTION DE LA VITESSE
    vidElement.playbackRate = 1.0;

    // 2. CALCULS DES EFFETS VISUELS (ZOOM & TREMBLEMENT)
    const scale = 1.0 + (this.bass > 100 ? (this.bass - 100) / 1000 : 0);
    const finalScale = isBg ? scale * 1.1 : scale;

    const shakeIntensity = (this.volume > 150) ? (this.volume - 150) / 10 : 0;
    const dx = (Math.random() - 0.5) * shakeIntensity * (isBg ? 5 : 2);
    const dy = (Math.random() - 0.5) * shakeIntensity * (isBg ? 5 : 2);

    const nw = w * finalScale;
    const nh = h * finalScale;
    const nx = (w - nw) / 2 + dx;
    const ny = (h - nh) / 2 + dy;

    c.save();

    // 3. EFFET GLITCH (SUR LES AIGUS)
    if (this.treble > 100 && !isBg) {
      c.globalAlpha = 0.8;
      c.drawImage(vidElement, nx, ny, nw, nh);
      c.globalAlpha = 1.0;
      c.globalCompositeOperation = 'lighter';

      // Découpage de bandes horizontales aléatoires
      const slices = Math.floor(this.treble / 20);
      for (let i = 0; i < slices; i++) {
        const sliceH = Math.random() * (h / 4);
        const sliceY = Math.random() * h;
        const offset = (Math.random() - 0.5) * this.treble;
        try {
          c.drawImage(vidElement, 0, sliceY / finalScale, vidElement.videoWidth, sliceH / finalScale, nx + offset, ny + sliceY, nw, sliceH);
        } catch (e) {
          // Ignorer les erreurs de dessin
        }
      }

      // Flash coloré par dessus
      c.fillStyle = flashColor;
      c.globalCompositeOperation = 'overlay';
      c.fillRect(0, 0, w, h);
    } else {
      // Rendu Normal (avec un peu de contraste dynamique)
      if (!isBg) {
        c.filter = `contrast(${1 + this.bass / 300}) brightness(${1 + this.treble / 400})`;
      }
      c.drawImage(vidElement, nx, ny, nw, nh);
      c.filter = 'none';
    }
    c.restore();

    // 4. POST-PROCESSING (FLASH & VIGNETTE)
    // Gros Flash sur les kicks violents (> 220)
    if (this.bass > 220) {
      c.globalCompositeOperation = 'lighter'; // 'add' n'existe pas en TypeScript, utiliser 'lighter'
      c.fillStyle = flashColor;
      c.globalAlpha = (this.bass - 220) / 100;
      c.fillRect(0, 0, w, h);
      c.globalAlpha = 1.0;
    }

    // Vignette sombre (contours de l'écran)
    c.globalCompositeOperation = 'source-over';
    const gradient = c.createRadialGradient(w / 2, h / 2, h * 0.3, w / 2, h / 2, h * 0.8);
    gradient.addColorStop(0, "rgba(0,0,0,0)");
    gradient.addColorStop(1, "rgba(0,0,0,0.6)");
    c.fillStyle = gradient;
    c.fillRect(0, 0, w, h);

    // Scanlines TV discrètes
    c.fillStyle = "rgba(0, 0, 0, 0.2)";
    for (let i = 0; i < h; i += 4) {
      c.fillRect(0, i, w, 1);
    }
  }
}