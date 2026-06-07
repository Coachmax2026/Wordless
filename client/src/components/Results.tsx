import React from 'react';
import { GameState, Player } from '../types';
import { Trophy, Frown, RotateCcw } from 'lucide-react';

interface ResultsProps {
  gameState: GameState;
  me?: Player;
  onRestart: () => void;
}

const Results: React.FC<ResultsProps> = ({ gameState, me, onRestart }) => {
  const imposter = gameState.players.find(p => p.isImposter);
  const win = (me?.isImposter && gameState.winner === 'imposter') || (!me?.isImposter && gameState.winner === 'players');

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col pt-12 items-center">
      <div className="mb-8 flex flex-col items-center">
        {win ? (
          <div className="flex flex-col items-center">
             <Trophy size={80} className="text-yellow-500 mb-4 animate-bounce" />
             <h2 className="text-4xl font-black text-white italic">VICTORY!</h2>
          </div>
        ) : (
          <div className="flex flex-col items-center">
             <Frown size={80} className="text-red-500 mb-4" />
             <h2 className="text-4xl font-black text-white italic">DEFEAT...</h2>
          </div>
        )}
      </div>

      <div className="w-full bg-slate-800 rounded-3xl p-8 shadow-2xl mb-8">
        <div className="text-center mb-8">
          <p className="text-slate-400 uppercase tracking-widest text-xs font-bold mb-2">The Imposter Was</p>
          <div className="flex items-center justify-center space-x-4">
            <span className="text-6xl">{imposter?.character}</span>
            <div className="text-left">
              <p className="text-2xl font-black">{imposter?.name}</p>
              <p className="text-purple-400 font-bold">"{imposter?.word}"</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-slate-400 uppercase tracking-widest text-xs font-bold text-center">Players' Word</p>
          <p className="text-3xl font-black text-center text-white italic">
            {gameState.players.find(p => !p.isImposter)?.word}
          </p>
        </div>
      </div>

      <div className="w-full bg-slate-800/50 rounded-3xl p-6 mb-8">
        <h3 className="text-sm font-bold text-slate-400 uppercase mb-4 text-center">Vote Breakdown</h3>
        <div className="space-y-2">
          {gameState.players.map(p => {
             const votesForHim = gameState.players.filter(v => v.vote === p.id).length;
             return (
               <div key={p.id} className="flex items-center justify-between">
                 <div className="flex items-center">
                   <span className="mr-2">{p.character}</span>
                   <span className="font-bold">{p.name}</span>
                 </div>
                 <div className="flex space-x-1">
                   {Array.from({ length: votesForHim }).map((_, i) => (
                     <span key={i}>🗳️</span>
                   ))}
                 </div>
               </div>
             )
          })}
        </div>
      </div>

      {me?.isHost && (
        <button 
          onClick={onRestart}
          className="w-full py-4 bg-purple-600 hover:bg-purple-500 rounded-2xl font-bold text-xl shadow-lg transition-all flex items-center justify-center space-x-2"
        >
          <RotateCcw size={24} />
          <span>Play Again</span>
        </button>
      )}
    </div>
  );
};

export default Results;
