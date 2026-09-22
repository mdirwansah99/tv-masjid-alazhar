// =============================================
// SainsTerokai — Shared Type Definitions
// =============================================

// --- Character ---
export type CharacterId = 'alia' | 'aiman' | 'budi';

export interface Character {
  id: CharacterId;
  name: string;
  emoji: string;
  description: string;
  color: string;
  bgGradient: string;
}

// --- World ---
export type WorldId = 'hijau' | 'bahan' | 'tenaga' | 'bumi' | 'masa-depan';

export interface World {
  id: WorldId;
  name: string;
  emoji: string;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  description: string;
  locked: boolean;
  topics: Topic[];
}

// --- Topic ---
export interface Topic {
  id: string;
  worldId: WorldId;
  tahun: number;
  title: string;
  description: string;
  icon: string;
  games: GameConfig[];
  locked: boolean;
}

// --- Game types ---
export type GameType = 'quiz' | 'drag-drop' | 'lab-experiment';

export interface GameConfig {
  id: string;
  topicId: string;
  type: GameType;
  title: string;
  description: string;
}

// --- Quiz ---
export interface QuizQuestion {
  id: string;
  question: string;
  image?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

// --- Drag and Drop ---
export interface DragItem {
  id: string;
  label: string;
  emoji: string;
}

export interface DropZone {
  id: string;
  label: string;
  emoji: string;
  acceptIds: string[];
}

export interface DragDropData {
  instruction: string;
  items: DragItem[];
  zones: DropZone[];
}

// --- Lab Experiment ---
export interface LabStep {
  id: string;
  instruction: string;
  type: 'observe' | 'select' | 'drag' | 'click';
  options?: string[];
  correctAnswer?: string;
  feedbackCorrect?: string;
  feedbackWrong?: string;
  emoji?: string;
}

export interface LabExperimentData {
  title: string;
  objective: string;
  materials: { name: string; emoji: string }[];
  steps: LabStep[];
}

// --- Progress & Rewards ---
export interface GameResult {
  gameId: string;
  topicId: string;
  worldId: WorldId;
  stars: number; // 0-3
  score: number;
  maxScore: number;
  completedAt: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  unlockedAt?: string;
}

export interface PlayerProgress {
  characterId: CharacterId;
  playerName: string;
  totalStars: number;
  badges: Badge[];
  completedGames: Record<string, GameResult>;
}

// --- Navigation ---
export type Screen =
  | 'splash'
  | 'character-select'
  | 'world-map'
  | 'topic-select'
  | 'game'
  | 'result'
  | 'profile';
