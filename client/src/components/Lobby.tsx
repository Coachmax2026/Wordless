import React from 'react';
import { GameState, Player } from '../types';

interface LobbyProps {
  gameState: GameState;
  me?: Player;
  onStart: () => void;
}

const Lobby: React.FC<LobbyProps> = ({ gameState, me, onStart }) => {
  return (
    <div className="max-w-md mx-auto h-screen flex flex-col pt-12">
      <div className="text-center mb-8">
        <h2 className="text-sm font-medium text-slate-400 uppercase tracking-widest mb-1">Room Code</h2>
        <p className="text-6xl font-black tracking-widest text-purple-500">{gameState.roomId}</p>
      </div>

      <div className="flex-1 bg-slate-800 rounded-t-3xl p-6 shadow-2xl overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Players ({gameState.players.length})</h3>
          <span className="text-sm text-slate-400">Waiting for host...</span>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {gameState.players.map((p) => (
            <div 
              key={p.id} 
              className={`flex items-center p-4 rounded-2xl ${
                p.id === me?.id ? 'bg-slate-700 ring-2 ring-purple-500' : 'bg-slate-700/50'
              }`}
            >
              <span className="text-3xl mr-4">{p.character}</span>
              <div className="flex-1">
                <p className="font-bold text-lg">{p.name} {p.id === me?.id && '(You)'}</p>
                {p.isHost && <span className="text-xs bg-yellow-600/20 text-yellow-500 px-2 py-0.5 rounded-full font-bold uppercase">Host</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 bg-slate-800">
        {me?.isHost ? (
          <button 
            onClick={onStart}
            disabled={gameState.players.length < 3}
            className="w-full py-4 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:hover:bg-purple-600 rounded-2xl font-bold text-xl shadow-lg transition-all"
          >
            {gameState.players.length < 3 ? 'Need 3+ Players' : 'Start Game'}
          </button>
        ) : (
          <div className="w-full py-4 bg-slate-700 rounded-2xl font-bold text-xl text-center text-slate-400">
            Waiting for Host
          </div>
        )}
      </div>
    </div>
  );
};

export default Lobby;
