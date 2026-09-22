# Game Design Document (GDD): Neuro-Navigators

## 1. Project Overview
**Title:** Neuro-Navigators
**Target Audience:** Children (Ages 8-10)
**Genre:** Puzzle / Cognitive Training
**Platform:** Web (React) / Responsive Mobile & Desktop
**Theme:** Sci-Fi Space Exploration

## 2. Core Gameplay Loop (Expanded)
Players take on the role of a "Star-Mapper". Their spaceship's navigation computer has lost its neural pathways, and they must rebuild them by completing cognitive challenges.

### 2.1 Mini-Game 1: Asteroid Matrix (Working Memory & Inhibition)
*   **Mechanic:** A grid of asteroids lights up in a specific sequence. The player must replicate it.
*   **Neuro-Target:** Visuospatial Working Memory.
*   **Twist (Inhibitory Control):** "Red Alert" (Solar Flare). When the screen flashes red, the player must *not* click anything for 3 seconds, resisting the urge to immediately repeat the pattern.

### 2.2 Mini-Game 2: Gravity Shifter (Cognitive Flexibility) - *Upcoming*
*   **Mechanic:** The player must sort cargo boxes into specific colored bays. However, the rule suddenly changes (e.g., sort by color, then suddenly sort by shape).
*   **Neuro-Target:** Cognitive Flexibility (Set-shifting).

## 3. Dynamic Difficulty Adjustment (DDA) Engine
The game tracks a `streak` variable.
*   **Level Up (+1 Sequence Length, +10% Speed):** Achieved after 3 consecutive correct patterns.
*   **Level Down (-1 Sequence Length, -20% Speed):** Triggered after 2 consecutive failures to prevent emotional dysregulation and frustration.

## 4. Telemetry & Data Schema (For Parents/Educators)
Every interaction generates a telemetry event to track neuro-developmental progress.

```json
{
  "sessionId": "uuid",
  "timestamp": "ISO-8601",
  "eventType": "INHIBITION_TASK_FAILED",
  "data": {
    "currentDifficultyLevel": 4,
    "reactionTimeMs": 450,
    "clickedEarly": true,
    "fatigueIndicator": "high" // inferred from multiple errors
  }
}
```

## 5. Visual & Audio Style Guide (Neuro-Inclusive)
*   **Colors:** Deep space backgrounds (`#0b0c10`), cyan/magenta high-contrast targets. Avoid rapid strobe effects.
*   **Fonts:** Sans-serif, dyslexia-friendly (e.g., Comic Sans, OpenDyslexic, or clean UI fonts like Segoe UI).
*   **Audio:** Web Audio API generated. Sine waves for positive reinforcement (reduces sensory overload). Sawtooth for alerts.

## 6. Architecture (React)
*   `src/components/` - Reusable UI (Buttons, HUD).
*   `src/game/` - The core Canvas/Game Engine logic.
*   `src/hooks/` - `useTelemetry`, `useDDA` (custom React hooks for logic separation).
*   `src/audio/` - AudioContext wrapper class.
