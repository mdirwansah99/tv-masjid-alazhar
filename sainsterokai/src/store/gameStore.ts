// =============================================
// SainsTerokai — Zustand Game Store
// Manages all game state with localStorage persistence
// =============================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Screen,
  CharacterId,
  WorldId,
  PlayerProgress,
  GameResult,
  Badge,
} from '../types';

interface GameState {
  // Navigation
  screen: Screen;

  // Player
  playerProgress: PlayerProgress | null;

  // Current game context
  currentWorld: WorldId | null;
  currentTopic: string | null;
  currentGame: string | null;
  currentGameType: 'quiz' | 'drag-drop' | 'lab-experiment' | null;
  lastResult: GameResult | null;

  // Settings
  soundEnabled: boolean;
  musicEnabled: boolean;

  // Actions
  setScreen: (screen: Screen) => void;
  setCharacter: (characterId: CharacterId, name: string) => void;
  selectWorld: (worldId: WorldId) => void;
  selectTopic: (topicId: string) => void;
  startGame: (gameId: string, gameType: 'quiz' | 'drag-drop' | 'lab-experiment') => void;
  completeGame: (result: GameResult) => void;
  addBadge: (badge: Badge) => void;
  toggleSound: () => void;
  toggleMusic: () => void;
  resetProgress: () => void;
  goHome: () => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      // Initial state
      screen: 'splash',
      playerProgress: null,
      currentWorld: null,
      currentTopic: null,
      currentGame: null,
      currentGameType: null,
      lastResult: null,
      soundEnabled: true,
      musicEnabled: true,

      // Navigation
      setScreen: (screen) => set({ screen }),

      // Character setup
      setCharacter: (characterId, playerName) =>
        set({
          playerProgress: {
            characterId,
            playerName,
            totalStars: 0,
            badges: [],
            completedGames: {},
          },
          screen: 'world-map',
        }),

      // World selection
      selectWorld: (worldId) =>
        set({
          currentWorld: worldId,
          screen: 'topic-select',
        }),

      // Topic selection
      selectTopic: (topicId) =>
        set({
          currentTopic: topicId,
        }),

      // Game start
      startGame: (gameId, gameType) =>
        set({
          currentGame: gameId,
          currentGameType: gameType,
          screen: 'game',
        }),

      // Game completion
      completeGame: (result) => {
        const state = get();
        if (!state.playerProgress) return;

        const existingResult = state.playerProgress.completedGames[result.gameId];
        const bestStars = existingResult
          ? Math.max(existingResult.stars, result.stars)
          : result.stars;
        const starDiff = existingResult
          ? bestStars - existingResult.stars
          : result.stars;

        set({
          lastResult: result,
          screen: 'result',
          playerProgress: {
            ...state.playerProgress,
            totalStars: state.playerProgress.totalStars + starDiff,
            completedGames: {
              ...state.playerProgress.completedGames,
              [result.gameId]: {
                ...result,
                stars: bestStars,
              },
            },
          },
        });
      },

      // Badge system
      addBadge: (badge) => {
        const state = get();
        if (!state.playerProgress) return;
        if (state.playerProgress.badges.some((b) => b.id === badge.id)) return;

        set({
          playerProgress: {
            ...state.playerProgress,
            badges: [
              ...state.playerProgress.badges,
              { ...badge, unlockedAt: new Date().toISOString() },
            ],
          },
        });
      },

      // Settings
      toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
      toggleMusic: () => set((s) => ({ musicEnabled: !s.musicEnabled })),

      // Reset
      resetProgress: () =>
        set({
          playerProgress: null,
          currentWorld: null,
          currentTopic: null,
          currentGame: null,
          currentGameType: null,
          lastResult: null,
          screen: 'splash',
        }),

      // Home
      goHome: () =>
        set({
          currentWorld: null,
          currentTopic: null,
          currentGame: null,
          currentGameType: null,
          lastResult: null,
          screen: 'world-map',
        }),
    }),
    {
      name: 'sainsterokai-save',
      partialize: (state) => ({
        playerProgress: state.playerProgress,
        soundEnabled: state.soundEnabled,
        musicEnabled: state.musicEnabled,
      }),
    }
  )
);
