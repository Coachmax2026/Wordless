import React, { useState } from 'react';
import { GameState, Player } from '../types';

interface VoteProps {
  gameState: GameState;
  me?: Player;
  onVote: (playerId: string) => void;
}

const Vote: React.FC<VoteProps> = ({ gameState, me, onVote }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleVote = () => {
    if (selectedId) {
      onVote(selectedId);
    }
  };

  if (me?.vote) {
    return (
      <div className="max-w-md mx-auto h-screen flex flex-col justify-center items-center text-center">
        <div className="bg-slate-800 p-8 rounded-3xl shadow-2xl">
          <div className="text-6xl mb-6">🗳️</div>
          <h2 className="text-2xl font-bold mb-2">Vote Cast!</h2>
          <p className="text-slate-400">Waiting for others to finish voting...</p>
          <div className="mt-8 flex justify-center space-x-2">
             {gameState.players.filter(p => !p.vote).map(p => (
               <span key={p.id} className="text-2xl grayscale animate-pulse">{p.character}</span>
             ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto h-screen flex flex-col pt-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black mb-2 italic">WHO IS IT?</h2>
        <p className="text-slate-400">Vote for the player you think is the Imposter.</p>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-24">
        <div className="grid grid-cols-1 gap-3">
          {gameState.players.map((p) => (
            <button
              key={p.id}
              disabled={p.id === me?.id}
              onClick={() => setSelectedId(p.id)}
              className={`flex items-center p-4 rounded-2xl transition-all ${
                p.id === me?.id ? 'opacity-50 grayscale cursor-not-allowed' : 
                selectedId === p.id ? 'bg-purple-600 ring-4 ring-purple-400 scale-[1.02]' : 'bg-slate-800 hover:bg-slate-700'
              }`}
            >
              <span className="text-4xl mr-4">{p.character}</span>
              <div className="text-left">
                <p className="font-bold text-xl">{p.name}</p>
                <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">
                  {p.id === me?.id ? "That's you" : "Possible Imposter"}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-slate-900/80 backdrop-blur-md">
        <button
          onClick={handleVote}
          disabled={!selectedId}
          className="max-w-md mx-auto w-full py-4 bg-gradient-to-r from-red-600 to-purple-600 disabled:from-slate-700 disabled:to-slate-700 rounded-2xl font-bold text-xl shadow-lg transition-all"
        >
          Confirm Vote
        </button>
      </div>
    </div>
  );
};

export default Vote;
