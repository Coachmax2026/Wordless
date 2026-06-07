import React from 'react';
import { GameState, Player } from '../types';
import { Timer } from 'lucide-react';

interface GameProps {
  gameState: GameState;
  me?: Player;
}

const Game: React.FC<GameProps> = ({ gameState, me }) => {
  return (
    <div className="max-w-md mx-auto h-screen flex flex-col pt-12 items-center text-center">
      <div className="mb-12">
        <div className="flex items-center justify-center space-x-2 text-purple-400 mb-2">
          <Timer size={24} />
          <span className="text-2xl font-bold tracking-widest">{gameState.timer}s</span>
        </div>
        <h2 className="text-slate-400 uppercase tracking-widest text-sm font-bold">Discussion Phase</h2>
      </div>

      <div className="w-full bg-slate-800 p-8 rounded-3xl shadow-2xl border-2 border-purple-500/30">
        <p className="text-slate-400 uppercase tracking-widest text-xs font-bold mb-4">Your Secret Word</p>
        <h3 className="text-5xl font-black text-white mb-6">
          {me?.word || '???'}
        </h3>
        
        <div className="h-1 bg-slate-700 rounded-full mb-6">
          <div 
            className="h-full bg-purple-500 rounded-full transition-all duration-1000" 
            style={{ width: `${(gameState.timer / 60) * 100}%` }}
          />
        </div>

        <p className="text-slate-300 text-sm leading-relaxed">
          Discuss with other players without revealing your word directly. Try to figure out who has a different word!
        </p>
      </div>

      <div className="mt-12 w-full grid grid-cols-4 gap-4 px-4 opacity-50">
        {gameState.players.map(p => (
          <div key={p.id} className="flex flex-col items-center">
            <span className="text-3xl grayscale">{p.character}</span>
            <span className="text-[10px] uppercase font-bold mt-1 truncate w-full">{p.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Game;
