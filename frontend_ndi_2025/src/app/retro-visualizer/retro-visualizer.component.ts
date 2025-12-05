import { Component, ElementRef, ViewChild, AfterViewInit, HostListener, signal, WritableSignal, ChangeDetectionStrategy } from '@angular/core';
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
  private smoothedData: number[] = [];

  // Structure pour les particules Firefly
  private particles: { x: number, y: number, vx: number, vy: number, radius: number }[] = [];
  private numParticles = 80;

  // Variables spécifiques à Three.js
  private three: {
    renderer: any, scene: any, camera: any, clock: any, material: any, mesh: any,
    iResolution?: any, iMouse?: any, iBass?: any, iTime?: any, // Cybernetic Grid uniforms
    u_time?: any, u_resolution?: any, u_waveCount?: any, u_amplitude?: any, u_frequency?: any, u_brightness?: any, u_colorSeparation?: any // Electric Waves uniforms
  } | null = null;
  private mousePos = { x: 0, y: 0 };


  // Définition des univers (10 univers)
  readonly universes: Universe[] = [
    { name: "NEON BARS", primary: "#00f3ff", secondary: "#ff007f", bg: "#000000", draw: this.drawNeonBars.bind(this) },
    { name: "POLAR BLOB", primary: "#ff007f", secondary: "#00f3ff", bg: "#050011", draw: this.drawPolarBlob.bind(this) },
    { name: "OSCILLOSCOPE SINE", primary: "#FF00FF", secondary: "#00FF00", bg: "#000000", draw: this.drawOscilloscopeSine.bind(this) },
    { name: "RIPPLE MAP", primary: "#F5B041", secondary: "#3498DB", bg: "#000000", draw: this.drawRippleMap.bind(this) },
    { name: "SPECTRUM ECHO", primary: "#00FF00", secondary: "#FF00FF", bg: "#000000", draw: this.drawSpectrumEcho.bind(this) },
    { name: "GEOMETRY GRID", primary: "#00aaff", secondary: "#ffaa00", bg: "#101020", draw: this.drawGeometryGrid.bind(this) },
    { name: "FIREFLY", primary: "#39ff14", secondary: "#f0f0f0", bg: "#000000", draw: this.drawFirefly.bind(this) },
    { name: "TOXIC", primary: "#FF3333", secondary: "#00f3ff", bg: "#000000", draw: this.drawToxic.bind(this) },
    { name: "COSMIC", primary: "#8A2BE2", secondary: "#00aaff", bg: "#000510", draw: this.drawCosmic.bind(this) },
    {
      name: "CYBERNETIC GRID",
      primary: "#00FFC0",
      secondary: "#FF00FF",
      bg: "#000000",
      draw: this.drawCyberneticGrid.bind(this),
      init3D: this.initCyberneticGrid.bind(this),
      dispose3D: this.disposeCyberneticGrid.bind(this)
    } // STYLE COMPLEXE THREE.JS
  ];

  get currentUniverse(): Universe {
    return this.universes[this.playerState().currentUniverseIndex];
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

    // Initialisation des particules
    this.initParticles(this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);

    // Écouteurs pour l'état du lecteur
    audioEl.addEventListener('play', () => {
      this.playerState.update(state => ({ ...state, isPlaying: true, statusText: 'RUNNING' }));
      this.render();
    });

    audioEl.addEventListener('pause', () => {
      this.playerState.update(state => ({ ...state, isPlaying: false, statusText: 'PAUSED' }));
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
    }
    // Réinitialiser les particules lors du redimensionnement
    this.initParticles(this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);
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
      this.three = null;
    }

    // 2. Changement d'index
    this.playerState.update(state => ({
      ...state,
      currentUniverseIndex: (state.currentUniverseIndex + 1) % this.universes.length,
    }));
    this.updateUniverseColors();

    // 3. INITIALISATION du nouvel univers 3D si nécessaire
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
    // Assurer que le rendu est actif
    if (this.playerState().isPlaying || newUniverse.init3D) {
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

    if (this.playerState().isPlaying) {
      this.audioRef.nativeElement.pause();
    } else {
      if (this.audioContext && this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }
      this.audioRef.nativeElement.play().catch(e => console.error("Erreur de lecture:", e));
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

    // Analyse Basse
    let tempBass = 0;
    for(let i=0; i<5; i++) { tempBass += this.dataArray[i]; }
    this.bass = tempBass / 5; // Basse (0-255)

    // Lissage et Tick
    for(let i=0; i<this.dataArray.length; i++) {
      this.smoothedData[i] += (this.dataArray[i] - this.smoothedData[i]) * 0.2;
    }
    this.tick++;

    // Rendu 3D (Shader)
    if (this.three) {
      const delta = this.three.clock.getDelta();
      const bassNorm = this.bass / 255.0; // Basse normalisée (0.0 - 1.0)

      // Mise à jour des uniformes de l'ancien mode THREE.js (Electric Waves - non inclus mais pour compatibilité)
      if (this.three.u_time) {
        this.three.u_time.value += delta;
        this.three.u_amplitude.value = 0.1 + bassNorm * 0.2;
        this.three.u_frequency.value = 2.0 + bassNorm * 3.0;
      }

      // Mise à jour des uniformes du CYBERNETIC GRID
      if (this.three.iTime) {
        this.three.iTime.value += delta;
        // La basse influence la "hauteur" de la grille et l'effet de zoom
        this.three.iBass.value = 0.1 + bassNorm * 0.8;
      }

      this.three.renderer.render(this.three.scene, this.three.camera);
      return;
    }

    // Logique 2D Canvas
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
      this.three = null;
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
  // === UNIVERS 3 : OSCILLOSCOPE SINE ===
  // ==========================================================
  private drawOscilloscopeSine(c: CanvasRenderingContext2D, w: number, h: number, isBg: boolean): void {
    c.globalCompositeOperation = 'source-over';
    c.fillStyle = isBg ? 'rgba(0, 0, 0, 0.05)' : 'rgba(0, 0, 0, 0.1)';
    c.fillRect(0, 0, w, h);

    c.globalCompositeOperation = 'lighter';
    c.lineWidth = isBg ? 2 : 3;

    const color = this.playerState().primaryColor;
    c.strokeStyle = color;
    c.shadowColor = color;
    c.shadowBlur = isBg ? 15 : 8;

    c.beginPath();
    const sliceWidth = w / this.timeDataArray.length;
    let x = 0;

    for (let i = 0; i < this.timeDataArray.length; i++) {
      const v = this.timeDataArray[i] / 255.0;
      const y = v * h;

      if (i === 0) {
        c.moveTo(x, y);
      } else {
        c.lineTo(x, y);
      }
      x += sliceWidth;
    }

    c.lineTo(w, h / 2);
    c.stroke();

    c.shadowBlur = 0;
  }

  // ==========================================================
  // === UNIVERS 4 : RIPPLE MAP ===
  // ==========================================================
  private drawRippleMap(c: CanvasRenderingContext2D, w: number, h: number, isBg: boolean): void {
    c.globalCompositeOperation = 'source-over';
    c.fillStyle = isBg ? 'rgba(0, 0, 0, 0.05)' : 'rgba(0, 0, 0, 0.1)';
    c.fillRect(0, 0, w, h);

    c.globalCompositeOperation = 'lighter';

    const gridSize = isBg ? 15 : 10;
    const cellWidth = w / gridSize;
    const cellHeight = h / gridSize;

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const lowFreqIndex = Math.floor(i * (this.bufferLength / gridSize) * 0.5);
        const highFreqIndex = Math.floor(j * (this.bufferLength / gridSize) * 0.5) + this.bufferLength / 2;

        const lowAmp = this.smoothedData[lowFreqIndex] || 0;
        const highAmp = this.smoothedData[highFreqIndex] || 0;

        const totalAmp = (lowAmp + highAmp) / 2;

        const radius = (totalAmp / 255) * cellWidth * 0.35;

        const hue = 200 + (lowAmp - highAmp) * 0.1;
        const color = `hsl(${hue}, 100%, ${30 + totalAmp * 0.2}%)`;

        c.fillStyle = color;
        c.shadowColor = color;
        c.shadowBlur = radius * 2;

        const cx = i * cellWidth + cellWidth / 2;
        const cy = j * cellHeight + cellHeight / 2;

        c.beginPath();
        c.arc(cx, cy, radius, 0, Math.PI * 2);
        c.fill();
      }
    }
    c.shadowBlur = 0;
  }

  // ==========================================================
  // === UNIVERS 5 : SPECTRUM ECHO ===
  // ==========================================================
  private drawSpectrumEcho(c: CanvasRenderingContext2D, w: number, h: number, isBg: boolean): void {
    c.globalCompositeOperation = 'source-over';
    c.fillStyle = isBg ? 'rgba(0, 0, 0, 0.05)' : 'rgba(0, 0, 0, 0.1)';
    c.fillRect(0, 0, w, h);

    c.globalCompositeOperation = 'lighter';
    c.lineWidth = isBg ? 2 : 1;
    c.shadowBlur = isBg ? 30 : 10;

    const waveHeight = h * 0.4;
    const midY = h / 2;
    const totalPoints = this.bufferLength;

    for(let k = 0; k < 2; k++) {
      const offset = k === 0 ? 0 : Math.PI;
      const baseColor = k === 0 ? this.currentUniverse.primary : this.currentUniverse.secondary;

      c.beginPath();
      c.strokeStyle = baseColor;
      c.shadowColor = baseColor;
      c.moveTo(0, midY);

      for (let i = 0; i < totalPoints; i++) {
        const amplitude = this.smoothedData[i] || 0;
        const wave = Math.sin((i / totalPoints) * Math.PI * 2 + this.tick * 0.05 + offset);
        const y = midY + (wave * waveHeight * (amplitude / 255));
        c.lineTo((i / totalPoints) * w, y);
      }
      c.stroke();
    }

    c.shadowBlur = 0;
    c.shadowColor = 'transparent';
  }


  // ==========================================================
  // === UNIVERS 6 : GEOMETRY GRID ===
  // ==========================================================
  private drawGeometryGrid(c: CanvasRenderingContext2D, w: number, h: number, isBg: boolean): void {
    c.globalCompositeOperation = 'source-over';
    c.fillStyle = isBg ? 'rgba(16, 16, 32, 0.1)' : 'rgba(16, 16, 32, 0.3)';
    c.fillRect(0, 0, w, h);

    c.globalCompositeOperation = 'lighter';
    const numRows = 10;
    const numCols = 10;
    const spacingX = w / numCols;
    const spacingY = h / numRows;
    const maxZ = h * (isBg ? 0.3 : 0.15);
    const baseColorHue = 240 + (this.bass * 0.5);

    const hoverFactor = this.isHovering ? 1.5 : 1.0;
    const rotationSpeed = this.isHovering ? 0.05 : 0.02;

    c.lineWidth = isBg ? 0.5 : 1;

    for (let j = 0; j <= numRows; j++) {
      for (let i = 0; i <= numCols; i++) {
        const x = i * spacingX;
        const y = j * spacingY;

        const freqIndex = Math.floor(i * (this.bufferLength / numCols));
        const amplitude = this.smoothedData[freqIndex] || 0;

        const z = (amplitude / 255) * maxZ * hoverFactor;

        const offset = z * 0.5;

        const drawX = x + offset * Math.sin(this.tick * rotationSpeed);
        const drawY = y - offset * Math.cos(this.tick * rotationSpeed);

        const color = `hsl(${baseColorHue}, 90%, ${50 + amplitude * 0.1 * hoverFactor}%)`;
        c.fillStyle = color;
        c.strokeStyle = color;
        c.shadowColor = color;
        c.shadowBlur = isBg ? 8 : 3;

        c.beginPath();
        c.arc(drawX, drawY, isBg ? 1.5 : 2, 0, Math.PI * 2);
        c.fill();

        if (i < numCols) {
          const nextIndex = Math.floor((i + 1) * (this.bufferLength / numCols));
          const nextAmp = this.smoothedData[nextIndex] || 0;
          const nextZ = (nextAmp / 255) * maxZ * hoverFactor;
          const nextOffset = nextZ * 0.5;

          c.beginPath();
          c.moveTo(drawX, drawY);
          c.lineTo(x + spacingX + nextOffset * Math.sin(this.tick * rotationSpeed), y - nextOffset * Math.cos(this.tick * rotationSpeed));
          c.stroke();
        }

        if (j < numRows) {
          const nextIndex = freqIndex;
          const nextAmp = amplitude;
          const nextZ = (nextAmp / 255) * maxZ * hoverFactor;
          const nextOffset = nextZ * 0.5;

          c.beginPath();
          c.moveTo(drawX, drawY);
          c.lineTo(x + nextOffset * Math.sin(this.tick * rotationSpeed), y + spacingY - nextOffset * Math.cos(this.tick * rotationSpeed));
          c.stroke();
        }
      }
    }

    c.shadowBlur = 0;
    c.shadowColor = 'transparent';
  }


  // ==========================================================
  // === UNIVERS 7 : FIREFLY ===
  // ==========================================================
  private initParticles(w: number, h: number): void {
    this.particles = [];
    for (let i = 0; i < this.numParticles; i++) {
      this.particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        radius: Math.random() * 2 + 1,
      });
    }
  }

  private drawFirefly(c: CanvasRenderingContext2D, w: number, h: number, isBg: boolean): void {
    c.globalCompositeOperation = 'source-over';
    c.fillStyle = isBg ? 'rgba(0, 0, 0, 0.15)' : 'rgba(0, 0, 0, 0.2)';
    c.fillRect(0, 0, w, h);

    c.globalCompositeOperation = 'lighter';

    const energyScale = 1 + (this.bass / 255) * 0.3;

    for (let i = 0; i < this.numParticles; i++) {
      const p = this.particles[i];

      const audioInfluence = this.smoothedData[Math.floor(i * (this.bufferLength / this.numParticles))] / 255;

      p.x += p.vx * energyScale;
      p.y += p.vy * energyScale;

      p.vx += (Math.random() - 0.5) * 0.01 * audioInfluence;
      p.vy += (Math.random() - 0.5) * 0.01 * audioInfluence;

      p.vx = Math.max(Math.min(p.vx, 0.5), -0.5);
      p.vy = Math.max(Math.min(p.vy, 0.5), -0.5);

      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;

      const radius = p.radius * energyScale;
      const alpha = 0.5 + audioInfluence * 0.5;

      c.fillStyle = `rgba(57, 255, 20, ${alpha})`;
      c.shadowColor = `rgba(57, 255, 20, 1)`;
      c.shadowBlur = radius * 3;

      c.beginPath();
      c.arc(p.x, p.y, radius, 0, Math.PI * 2);
      c.fill();
    }
  }

  // ==========================================================
  // === UNIVERS 8 : TOXIC ===
  // ==========================================================
  private drawToxic(c: CanvasRenderingContext2D, w: number, h: number, isBg: boolean): void {
    c.globalCompositeOperation = 'source-over';
    c.fillStyle = "rgba(0, 0, 0, 0.6)";
    c.fillRect(0, 0, w, h);

    c.globalCompositeOperation = 'lighter';
    c.shadowBlur = isBg ? 10 : 4;
    c.shadowColor = this.currentUniverse.primary;
    c.fillStyle = this.currentUniverse.primary;

    let bars = 40;
    let step = w / bars;
    const barInnerWidth = step * 0.4;

    let shakeX = (this.bass > 200) ? (Math.random()-0.5)*10 : 0;

    for(let i=0; i<bars; i++) {
      let val = this.smoothedData[i*2] || 0;
      let barH = val * (isBg ? 1.0 : 0.6);

      const xPos = i * step + (step - barInnerWidth) / 2 + shakeX;

      c.fillRect(xPos, h/2 - barH, barInnerWidth, barH*2);

      const peakSize = barH * 0.2;
      c.fillStyle = this.currentUniverse.secondary;
      c.fillRect(xPos, h/2 - barH - peakSize, barInnerWidth, peakSize);
      c.fillRect(xPos, h/2 + barH, barInnerWidth, peakSize);
      c.fillStyle = this.currentUniverse.primary;


      if (!isBg && val > 150 && Math.random() > 0.9) {
        c.fillStyle = this.currentUniverse.secondary;
        c.font = '12px VT323';
        c.fillText(Math.random()>0.5?"1":"0", xPos, h/2 - barH - (Math.random()*30));
        c.fillStyle = this.currentUniverse.primary;
      }
    }
  }

  // ==========================================================
  // === UNIVERS 9 : COSMIC ===
  // ==========================================================
  private drawCosmic(c: CanvasRenderingContext2D, w: number, h: number, isBg: boolean): void {
    c.globalCompositeOperation = 'source-over';
    c.fillStyle = "rgba(0, 5, 20, 0.1)"; c.fillRect(0, 0, w, h);

    let cx = w/2;
    let cy = h/2;

    c.globalCompositeOperation = 'lighter';
    c.shadowBlur = isBg ? 50 : 20;
    c.shadowColor = "#8a00ff";
    c.strokeStyle = "#00aaff";
    c.lineWidth = isBg ? 4 : 2;

    c.beginPath();
    let radius = isBg ? h*0.3 : h*0.2;
    for(let i=0; i<60; i++) {
      let angle = (i/60) * Math.PI * 2;
      let val = this.smoothedData[i % 40];
      let r = radius + (val * (isBg ? 1.5 : 0.6));
      let rot = this.tick * 0.01;
      let x = cx + Math.cos(angle + rot) * r;
      let y = cy + Math.sin(angle + rot) * r;
      if(i===0) c.moveTo(x,y); else c.lineTo(x,y);
    }
    c.closePath();
    c.stroke();
  }
}
