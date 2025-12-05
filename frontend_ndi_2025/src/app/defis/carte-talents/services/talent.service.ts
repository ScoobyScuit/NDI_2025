import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * ========================================
 * MODÈLE DE DONNÉES COMPLET POUR UN TALENT
 * ========================================
 */

// Types pour les niveaux et catégories
export type NiveauMaitrise = 'débutant' | 'intermédiaire' | 'avancé' | 'expert' | 'maître' | 'légendaire';
export type CategorieTalent = 'technique' | 'artistique' | 'physique' | 'social' | 'analytique' | 'créatif' | 'leadership';
export type ImpactLevel = 'faible' | 'moyen' | 'fort' | 'destructeur';

// Interface pour les statistiques
export interface TalentStats {
  principale: { nom: string; valeur: number }; // ex: { nom: 'Intelligence', valeur: 85 }
  secondaires: { nom: string; valeur: number }[];
  tauxReussite: number;      // 0-100
  precision: number;         // 0-100
  rapidite: number;          // 0-100
  impact: ImpactLevel;
}

// Interface pour les coûts/ressources
export interface TalentCost {
  energie: number;           // 0-100
  fatigue: number;           // 0-100
  ressourcesRequises?: string[];
}

// Interface pour les limites
export interface TalentLimites {
  conditions: string[];      // Conditions d'activation
  dureeEffet?: string;       // "2 heures", "permanent"
  cooldown?: string;         // "1 jour", "1 semaine"
  frequenceMax?: string;     // "3x/jour"
  risqueEchec: number;       // 0-100
}

// Interface pour l'évolution
export interface TalentEvolution {
  niveauSuivant?: string;
  conditionsAmelioration: string[];
  capacitesDebloquables: string[];
  xpNecessaire: number;
}

// Interface pour l'historique
export interface TalentHistorique {
  acquisition: string;       // Comment acquis
  mentor?: string;
  formation?: string;
  evenementDeclencheur?: string;
  evolutionTemps: string[];  // Étapes d'évolution
}

// Interface pour les synergies
export interface TalentSynergie {
  talentsCompatibles: string[];
  bonusEquipe: string[];
  situationsExcellence: string[];
  combos: string[];
}

// Interface pour les faiblesses
export interface TalentFaiblesses {
  contreIndications: string[];
  talentsNeutralisants: string[];
  defautsNaturels: string[];
  coutEleve: string[];
}

// Interface pour le style
export interface TalentStyle {
  signature?: string;        // Gestuelle, marque de fabrique
  surnom?: string;           // Surnom lié au talent
  citation?: string;         // Citation associée
  effetsVisuels?: string;    // Description des effets
}

// Interface pour les interactions sociales
export interface TalentSocial {
  appreciePar: string[];
  redoutePar: string[];
  influenceGroupe: string;
  compatibilitesProfils: string[];
}

/**
 * Interface principale du Talent - VERSION COMPLÈTE
 */
export interface Talent {
  id: string;
  
  // ===== 1. INFORMATIONS GÉNÉRALES =====
  nom: string;
  age?: number;
  genre?: 'homme' | 'femme' | 'autre' | 'non-specifie';
  origine?: string;
  nationalite?: string;
  ville?: string;
  promo?: string;
  email?: string;
  avatarUrl?: string;
  avatarInitials?: string;
  avatarColor?: string;
  
  // ===== 2. DESCRIPTION DU TALENT =====
  role: string;                    // Titre du talent
  niveau: NiveauMaitrise;
  categorie: CategorieTalent;
  bio?: string;                    // Description globale
  specificites: string[];          // Sous-talents
  domainesApplication: string[];   // Où ça s'applique
  
  // ===== 3. ATTRIBUTS TECHNIQUES =====
  stats: TalentStats;
  cout: TalentCost;
  limites: TalentLimites;
  
  // ===== 4. COMPÉTENCES & AVANTAGES =====
  competences: string[];           // Skills principales
  forcesPrincipales: string[];
  bonusPassifs: string[];
  effetsSpeciaux: string[];
  synergies: TalentSynergie;
  
  // ===== 5. FAIBLESSES =====
  faiblesses: TalentFaiblesses;
  
  // ===== 6. HISTORIQUE =====
  historique: TalentHistorique;
  
  // ===== 7. EXEMPLES D'UTILISATION =====
  exemplesUtilisation: string[];
  casReels: string[];
  
  // ===== 8. ÉVOLUTIONS =====
  evolution: TalentEvolution;
  xpActuel: number;
  
  // ===== 9. RESSOURCES =====
  materielRequis: string[];
  environnementIdeal: string[];
  competencesComplementaires: string[];
  
  // ===== 10. STYLE & SIGNATURE =====
  style: TalentStyle;
  
  // ===== 11. INTERACTIONS SOCIALES =====
  social: TalentSocial;
  
  // ===== 12. AUTRES =====
  langues: string[];
  passions: string[];
  projets: string[];
  tags: string[];
  verified: boolean;
  createdAt: Date;
}

/**
 * Données de test enrichies
 */
const MOCK_TALENTS: Talent[] = [
  {
    id: '1',
    nom: 'Alexandra Martin',
    age: 24,
    genre: 'femme',
    origine: 'Bretagne',
    nationalite: 'Française',
    ville: 'Lyon',
    promo: 'CESI 2025',
    email: 'alexandra.martin@example.com',
    avatarColor: '#22c55e',
    
    role: 'Facilitatrice & UX designer',
    niveau: 'expert',
    categorie: 'créatif',
    bio: `Spécialisée en facilitation d'ateliers et design d'expérience utilisateur. 
          Je crée des ponts entre les équipes techniques et les utilisateurs finaux.`,
    specificites: ['Design Thinking', 'Prototypage rapide', 'User Research'],
    domainesApplication: ['Startups', 'ESN', 'Associations'],
    
    stats: {
      principale: { nom: 'Créativité', valeur: 92 },
      secondaires: [
        { nom: 'Empathie', valeur: 88 },
        { nom: 'Communication', valeur: 85 },
        { nom: 'Analyse', valeur: 78 }
      ],
      tauxReussite: 94,
      precision: 89,
      rapidite: 82,
      impact: 'fort'
    },
    cout: {
      energie: 35,
      fatigue: 25,
      ressourcesRequises: ['Post-its', 'Whiteboard', 'Figma']
    },
    limites: {
      conditions: ['Équipe de min. 3 personnes', 'Espace calme'],
      dureeEffet: '2-4 heures par session',
      cooldown: 'Récupération 1 jour',
      frequenceMax: '2 sessions/jour',
      risqueEchec: 8
    },
    
    competences: ['UX Design', 'Figma', 'Facilitation', 'Miro'],
    forcesPrincipales: ['Vision utilisateur', 'Synthèse visuelle', 'Animation de groupe'],
    bonusPassifs: ['+15% cohésion équipe', '+20% clarté des specs'],
    effetsSpeciaux: ['Déblocage créatif instantané', 'Alignement des parties prenantes'],
    synergies: {
      talentsCompatibles: ['Développeur Frontend', 'Product Manager', 'Data Analyst'],
      bonusEquipe: ['Vitesse de décision x2', 'Moins de bugs UX'],
      situationsExcellence: ['Kick-off projet', 'Résolution de conflits', 'Innovation'],
      combos: ['UX + Dev = Prototype en 1 jour', 'UX + PM = Roadmap claire']
    },
    
    faiblesses: {
      contreIndications: ['Projets très techniques sans users', 'Deadlines < 2h'],
      talentsNeutralisants: ['Micro-manager', 'Client indécis'],
      defautsNaturels: ['Perfectionnisme', 'Trop de questions'],
      coutEleve: ['Grands groupes > 15 pers.']
    },
    
    historique: {
      acquisition: 'Formation Design Thinking à Stanford d-school (online)',
      mentor: 'Julie Chapon (ex-Yuka)',
      formation: 'Master UX Design - Gobelins',
      evenementDeclencheur: 'Hackathon 2022 - Prix du meilleur UX',
      evolutionTemps: ['2020: UI Designer', '2022: UX Designer', '2024: Lead UX & Facilitatrice']
    },
    
    exemplesUtilisation: [
      'Refonte app mobile bancaire (+40% satisfaction)',
      'Workshop innovation PME (3 nouveaux produits lancés)',
      'Formation équipe dev à l\'empathie utilisateur'
    ],
    casReels: ['BlaBlaCar - Amélioration du flow de réservation', 'Startup EdTech - MVP en 2 semaines'],
    
    evolution: {
      niveauSuivant: 'Design Director',
      conditionsAmelioration: ['Certif. facilitation avancée', '50 workshops menés'],
      capacitesDebloquables: ['Design System', 'Formation équipes', 'Audit UX'],
      xpNecessaire: 2500
    },
    xpActuel: 1850,
    
    materielRequis: ['MacBook Pro', 'Figma Pro', 'Post-its XXL', 'Markers'],
    environnementIdeal: ['Open space créatif', 'Salle avec tableaux'],
    competencesComplementaires: ['HTML/CSS basics', 'Notion', 'Analytics'],
    
    style: {
      signature: 'Toujours un croquis sur papier avant le digital',
      surnom: 'La Facilitatrice',
      citation: '"Un bon design est invisible, seul l\'impact reste"',
      effetsVisuels: 'Moodboards colorés et wireframes annotés'
    },
    
    social: {
      appreciePar: ['Équipes produit', 'Startups', 'Associations'],
      redoutePar: ['Développeurs pressés', 'Clients sans budget UX'],
      influenceGroupe: 'Fédératrice naturelle, crée de la cohésion',
      compatibilitesProfils: ['Product Manager', 'Développeur curieux', 'Marketeur']
    },
    
    langues: ['FR', 'EN'],
    passions: ['Jeux vidéo', 'Escape games', 'Sketchnoting'],
    projets: ['Plateforme de talents (NDI 2025)', 'App de méditation collaborative'],
    tags: ['UX', 'Design', 'Facilitation', 'Innovation'],
    verified: true,
    createdAt: new Date('2025-08-15')
  },
  {
    id: '2',
    nom: 'Yassine Bou',
    age: 26,
    genre: 'homme',
    origine: 'Maroc',
    nationalite: 'Franco-marocain',
    ville: 'Grenoble',
    promo: 'Epitech 2024',
    email: 'yassine.bourahla@example.com',
    avatarColor: '#3DB4AD',
    
    role: 'Développeur fullstack',
    niveau: 'avancé',
    categorie: 'technique',
    bio: `Passionné par le code propre et les architectures scalables.
          Je construis des applications web modernes avec Angular et Node.js.`,
    specificites: ['Angular avancé', 'API REST', 'DevOps basics'],
    domainesApplication: ['SaaS', 'E-commerce', 'Applications métier'],
    
    stats: {
      principale: { nom: 'Logique', valeur: 90 },
      secondaires: [
        { nom: 'Rigueur', valeur: 88 },
        { nom: 'Autonomie', valeur: 85 },
        { nom: 'Curiosité', valeur: 82 }
      ],
      tauxReussite: 91,
      precision: 94,
      rapidite: 78,
      impact: 'fort'
    },
    cout: {
      energie: 40,
      fatigue: 35,
      ressourcesRequises: ['IDE', 'Documentation', 'Café ☕']
    },
    limites: {
      conditions: ['Specs claires', 'Accès Git'],
      dureeEffet: 'Permanent (code livré)',
      cooldown: 'Aucun',
      frequenceMax: '8-10h/jour',
      risqueEchec: 12
    },
    
    competences: ['Angular', 'Node.js', 'TypeScript', 'PostgreSQL', 'Docker'],
    forcesPrincipales: ['Code maintenable', 'Tests unitaires', 'Documentation'],
    bonusPassifs: ['+25% vélocité sprint', '-30% dette technique'],
    effetsSpeciaux: ['Debugging éclair', 'Refactoring miracle'],
    synergies: {
      talentsCompatibles: ['DevOps', 'UX Designer', 'Product Owner'],
      bonusEquipe: ['CI/CD fiable', 'Moins de bugs en prod'],
      situationsExcellence: ['Développement from scratch', 'Migration technique'],
      combos: ['Fullstack + DevOps = Déploiement auto', 'Fullstack + UX = MVP rapide']
    },
    
    faiblesses: {
      contreIndications: ['Specs floues', 'Projet legacy sans tests'],
      talentsNeutralisants: ['Changements de scope fréquents'],
      defautsNaturels: ['Over-engineering parfois', 'Impatient avec mauvais code'],
      coutEleve: ['Projets sans challenge technique']
    },
    
    historique: {
      acquisition: 'Autodidacte puis Epitech',
      mentor: 'Senior dev chez OVH',
      formation: 'Epitech + certifications Angular',
      evenementDeclencheur: 'Premier projet open source à 1k stars',
      evolutionTemps: ['2020: Junior', '2022: Confirmé', '2024: Senior']
    },
    
    exemplesUtilisation: [
      'API e-commerce gérant 10k requêtes/min',
      'Migration Angular 12 → 17 sans downtime',
      'Dashboard analytics temps réel'
    ],
    casReels: ['Plateforme RH - 50k users', 'App logistique - 200 entrepôts'],
    
    evolution: {
      niveauSuivant: 'Tech Lead',
      conditionsAmelioration: ['Certif. architecture', 'Mentorer 3 juniors'],
      capacitesDebloquables: ['System Design', 'Team management', 'Tech strategy'],
      xpNecessaire: 3000
    },
    xpActuel: 2100,
    
    materielRequis: ['MacBook M2', 'Écran 4K', 'Clavier mécanique'],
    environnementIdeal: ['Calme', 'Musique lo-fi', 'Standing desk'],
    competencesComplementaires: ['AWS', 'Kubernetes', 'GraphQL'],
    
    style: {
      signature: 'Commits atomiques et PRs bien documentées',
      surnom: 'Le Debugger',
      citation: '"Un code sans tests est un code qui n\'existe pas"',
      effetsVisuels: 'Terminal customisé avec Oh-My-Zsh'
    },
    
    social: {
      appreciePar: ['Product managers', 'QA', 'Autres devs'],
      redoutePar: ['Ceux qui pushent en prod le vendredi'],
      influenceGroupe: 'Référent technique, aide les juniors',
      compatibilitesProfils: ['DevOps', 'UX', 'Data Engineer']
    },
    
    langues: ['FR', 'EN', 'AR'],
    passions: ['Open source', 'Gaming', 'Domotique'],
    projets: ['Contrib Angular Material', 'Bot Discord pour NDI'],
    tags: ['Angular', 'Node.js', 'TypeScript', 'Clean Code'],
    verified: true,
    createdAt: new Date('2025-09-20')
  },
  {
    id: '3',
    nom: 'Clara Dupuis',
    age: 23,
    genre: 'femme',
    origine: 'Normandie',
    nationalite: 'Française',
    ville: 'Paris',
    promo: 'CESI 2026',
    email: 'clara.dupuis@example.com',
    avatarColor: '#f97316',
    
    role: 'Chargée de projets RSE',
    niveau: 'intermédiaire',
    categorie: 'social',
    bio: `Je construis des projets concrets autour de la RSE et de la transition,
          en impliquant le plus possible les étudiants et entreprises.`,
    specificites: ['Gestion de projet durable', 'Animation RSE', 'Communication impact'],
    domainesApplication: ['Entreprises', 'Associations', 'Collectivités'],
    
    stats: {
      principale: { nom: 'Leadership', valeur: 84 },
      secondaires: [
        { nom: 'Communication', valeur: 88 },
        { nom: 'Organisation', valeur: 82 },
        { nom: 'Persuasion', valeur: 80 }
      ],
      tauxReussite: 87,
      precision: 85,
      rapidite: 75,
      impact: 'fort'
    },
    cout: {
      energie: 30,
      fatigue: 40,
      ressourcesRequises: ['Partenaires', 'Budget com\'', 'Temps']
    },
    limites: {
      conditions: ['Soutien direction', 'Budget minimum'],
      dureeEffet: 'Long terme (6-12 mois)',
      cooldown: 'Entre projets: 1 mois',
      frequenceMax: '2-3 projets/an',
      risqueEchec: 20
    },
    
    competences: ['Gestion de projet', 'RSE', 'Communication', 'Animation'],
    forcesPrincipales: ['Vision long terme', 'Fédération des acteurs', 'Impact mesurable'],
    bonusPassifs: ['+20% engagement employés', '+15% image marque'],
    effetsSpeciaux: ['Transformation culturelle', 'Mobilisation collective'],
    synergies: {
      talentsCompatibles: ['Community Manager', 'RH', 'Direction'],
      bonusEquipe: ['Cohésion autour des valeurs', 'Fierté d\'appartenance'],
      situationsExcellence: ['Lancement initiative RSE', 'Crise réputation'],
      combos: ['RSE + RH = Marque employeur forte', 'RSE + Com = Storytelling impact']
    },
    
    faiblesses: {
      contreIndications: ['Entreprise sans budget RSE', 'Direction non engagée'],
      talentsNeutralisants: ['Greenwashing', 'Court-termisme'],
      defautsNaturels: ['Idéalisme parfois', 'Frustration face à l\'inertie'],
      coutEleve: ['Changements de grande envergure']
    },
    
    historique: {
      acquisition: 'Engagement associatif depuis le lycée',
      mentor: 'Directrice RSE Danone',
      formation: 'Master Management Responsable',
      evenementDeclencheur: 'Organisation TEDx sur le climat',
      evolutionTemps: ['2021: Bénévole', '2023: Chargée de mission', '2025: Chef de projet']
    },
    
    exemplesUtilisation: [
      'Forum étudiants-entreprises engagées (500 participants)',
      'Podcast transition écologique (10k écoutes)',
      'Bilan carbone campus (-15% en 1 an)'
    ],
    casReels: ['Label RSE PME locale', 'Partenariat école-ONG'],
    
    evolution: {
      niveauSuivant: 'Responsable RSE',
      conditionsAmelioration: ['Certification ISO 26000', '5 projets réussis'],
      capacitesDebloquables: ['Stratégie RSE', 'Reporting extra-financier', 'Lobbying'],
      xpNecessaire: 2000
    },
    xpActuel: 1200,
    
    materielRequis: ['Outils de gestion projet', 'Réseau partenaires'],
    environnementIdeal: ['Entreprise engagée', 'Équipe motivée'],
    competencesComplementaires: ['Data analyse', 'Juridique RSE', 'Finance durable'],
    
    style: {
      signature: 'Toujours des chiffres d\'impact concrets',
      surnom: 'Miss Impact',
      citation: '"Chaque action compte, ensemble on change l\'échelle"',
      effetsVisuels: 'Présentations avec infographies impact'
    },
    
    social: {
      appreciePar: ['Millennials/Gen Z', 'Direction visionnaire', 'ONG'],
      redoutePar: ['Conservateurs', 'Profit-only mindset'],
      influenceGroupe: 'Inspirante, donne du sens au travail',
      compatibilitesProfils: ['Communication', 'RH', 'Innovation']
    },
    
    langues: ['FR', 'EN', 'ES'],
    passions: ['Climat', 'Podcast', 'Événementiel', 'Randonnée'],
    projets: ['Forum étudiants-entreprises', 'Podcast interne transition'],
    tags: ['RSE', 'Climat', 'Impact', 'Leadership'],
    verified: true,
    createdAt: new Date('2025-11-05')
  }
];

// Clé pour le localStorage
const STORAGE_KEY = 'talents_cards';

@Injectable({
  providedIn: 'root',
})
export class TalentService {

  private readonly _talents$ = new BehaviorSubject<Talent[]>([]);

  constructor() {
    this.loadFromStorage();
  }

  get talents$(): Observable<Talent[]> {
    return this._talents$.asObservable();
  }

  getTalentsSnapshot(): Talent[] {
    return this._talents$.getValue();
  }

  /**
   * Charger les talents depuis le localStorage
   * Si pas de données, utiliser les données mock
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convertir les dates string en objets Date
        const talents = parsed.map((t: any) => ({
          ...t,
          createdAt: new Date(t.createdAt)
        }));
        this._talents$.next(talents);
        console.log('✅ Talents chargés depuis localStorage:', talents.length);
      } else {
        // Première utilisation : charger les données mock
        this._talents$.next([...MOCK_TALENTS]);
        this.saveToStorage();
        console.log('📦 Données mock chargées et sauvegardées');
      }
    } catch (error) {
      console.error('❌ Erreur chargement localStorage:', error);
      this._talents$.next([...MOCK_TALENTS]);
    }
  }

  /**
   * Sauvegarder les talents dans le localStorage
   */
  private saveToStorage(): void {
    try {
      const talents = this._talents$.getValue();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(talents));
      console.log('💾 Talents sauvegardés:', talents.length);
    } catch (error) {
      console.error('❌ Erreur sauvegarde localStorage:', error);
    }
  }

  /**
   * Ajouter un nouveau talent
   */
  addTalent(talent: Talent): void {
    const current = this._talents$.getValue();
    // Générer un ID unique si pas fourni
    if (!talent.id) {
      talent.id = 'talent_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    // Ajouter la date de création
    if (!talent.createdAt) {
      talent.createdAt = new Date();
    }
    this._talents$.next([...current, talent]);
    this.saveToStorage();
    console.log('✨ Nouveau talent ajouté:', talent.nom);
  }

  /**
   * Mettre à jour un talent existant
   */
  updateTalent(id: string, partial: Partial<Talent>): void {
    const updated = this._talents$.getValue().map((t) =>
      t.id === id ? { ...t, ...partial } : t
    );
    this._talents$.next(updated);
    this.saveToStorage();
  }

  /**
   * Supprimer un talent
   */
  deleteTalent(id: string): void {
    const filtered = this._talents$.getValue().filter(t => t.id !== id);
    this._talents$.next(filtered);
    this.saveToStorage();
    console.log('🗑️ Talent supprimé:', id);
  }

  /**
   * Basculer le statut vérifié
   */
  toggleVerified(id: string): void {
    const current = this._talents$.getValue();
    const updated = current.map((t) =>
      t.id === id ? { ...t, verified: !t.verified } : t
    );
    this._talents$.next(updated);
    this.saveToStorage();
  }

  /**
   * Récupérer un talent par ID
   */
  getById(id: string): Talent | undefined {
    return this._talents$.getValue().find((t) => t.id === id);
  }

  /**
   * Réinitialiser avec les données mock (pour debug)
   */
  resetToMock(): void {
    this._talents$.next([...MOCK_TALENTS]);
    this.saveToStorage();
    console.log('🔄 Données réinitialisées avec les mock');
  }

  /**
   * Effacer toutes les données
   */
  clearAll(): void {
    this._talents$.next([]);
    localStorage.removeItem(STORAGE_KEY);
    console.log('🗑️ Toutes les données effacées');
  }

  // Méthodes utilitaires
  getTalentsByCategorie(categorie: CategorieTalent): Talent[] {
    return this._talents$.getValue().filter(t => t.categorie === categorie);
  }

  getTalentsByNiveau(niveau: NiveauMaitrise): Talent[] {
    return this._talents$.getValue().filter(t => t.niveau === niveau);
  }

  searchTalents(query: string): Talent[] {
    const q = query.toLowerCase();
    return this._talents$.getValue().filter(t => {
      const searchable = [
        t.nom, t.role, t.bio, t.ville,
        ...t.competences, ...t.tags, ...t.passions
      ].filter(Boolean).join(' ').toLowerCase();
      return searchable.includes(q);
    });
  }

  /**
   * Obtenir le nombre de talents créés par l'utilisateur (pas les mock)
   */
  getUserTalentsCount(): number {
    return this._talents$.getValue().filter(t => t.id.startsWith('talent_')).length;
  }
}
