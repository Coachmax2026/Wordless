export type Phase = 'lobby' | 'discussion' | 'voting' | 'results';

export interface Player {
  id: string;
  name: string;
  character: string;
  color: string;
  isHost: boolean;
  word?: string;
  isImposter: boolean;
  vote?: string;
  score: number;
}

export interface GameState {
  roomId: string;
  phase: Phase;
  players: Player[];
  category?: string;
  timer: number;
  winner?: 'players' | 'imposter';
  gameSettings: {
    discussionTime: number;
    votingTime: number;
  };
}
