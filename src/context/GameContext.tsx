import React, { createContext, useContext, useReducer, ReactNode } from 'react';

interface GameState {
  score: number;
  attempts: number;
  timeElapsed: number;
  isPlaying: boolean;
  matchedPairs: number;
}

interface GameAction {
  type: 'START_GAME' | 'INCREMENT_ATTEMPTS' | 'UPDATE_TIME' | 'MATCH_PAIR' | 'END_GAME' | 'RESET_GAME';
}

const initialState: GameState = {
  score: 0,
  attempts: 0,
  timeElapsed: 0,
  isPlaying: false,
  matchedPairs: 0,
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME':
      return { ...initialState, isPlaying: true };
    case 'INCREMENT_ATTEMPTS':
      return { 
        ...state, 
        attempts: state.attempts + 1,
        score: Math.max(0, 1000 - (state.attempts + 1) * 10)
      };
    case 'UPDATE_TIME':
      return { ...state, timeElapsed: state.timeElapsed + 1 };
    case 'MATCH_PAIR':
      return { ...state, matchedPairs: state.matchedPairs + 1 };
    case 'END_GAME':
      return { ...state, isPlaying: false };
    case 'RESET_GAME':
      return initialState;
    default:
      return state;
  }
}

const GameContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
} | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}