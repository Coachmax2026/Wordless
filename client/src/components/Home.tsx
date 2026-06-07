import React, { useState } from 'react';

interface HomeProps {
  onJoin: (roomId: string, name: string, character: string, color: string) => void;
  onCreate: (name: string, character: string, color: string) => void;
}

const CHARACTERS = [
  { emoji: '🦊', name: 'Fox', color: '#FF8C00' },
  { emoji: '🐻', name: 'Bear', color: '#8B4513' },
  { emoji: '🐰', name: 'Bunny', color: '#FF69B4' },
  { emoji: '🐱', name: 'Cat', color: '#9370DB' },
  { emoji: '🐶', name: 'Dog', color: '#1E90FF' },
  { emoji: '🐸', name: 'Frog', color: '#32CD32' },
  { emoji: '🐼', name: 'Panda', color: '#FFFFFF' },
  { emoji: '🦁', name: 'Lion', color: '#FFD700' },
];

const Home: React.FC<HomeProps> = ({ onJoin, onCreate }) => {
  const [name, setName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [selectedChar, setSelectedChar] = useState(CHARACTERS[0]);
  const [view, setView] = useState<'main' | 'join' | 'create'>('main');

  const handleAction = (isCreate: boolean) => {
    if (!name) return alert('Please enter your name');
    if (isCreate) {
      onCreate(name, selectedChar.emoji, selectedChar.color);
    } else {
      if (!roomId) return alert('Please enter room code');
      onJoin(roomId, name, selectedChar.emoji, selectedChar.color);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-6">
      <h1 className="text-5xl font-black mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
        WORDLESS
      </h1>

      <div className="w-full max-w-md bg-slate-800 p-8 rounded-3xl shadow-2xl space-y-6">
        {view === 'main' && (
          <div className="flex flex-col space-y-4">
            <button 
              onClick={() => setView('create')}
              className="w-full py-4 bg-purple-600 hover:bg-purple-500 rounded-2xl font-bold text-xl transition-all"
            >
              Create Game
            </button>
            <button 
              onClick={() => setView('join')}
              className="w-full py-4 bg-slate-700 hover:bg-slate-600 rounded-2xl font-bold text-xl transition-all"
            >
              Join Game
            </button>
          </div>
        )}

        {(view === 'join' || view === 'create') && (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-400 uppercase tracking-wider">Your Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                placeholder="Type your name..."
                className="w-full p-4 bg-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-lg"
              />
            </div>

            {view === 'join' && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-400 uppercase tracking-wider">Room Code</label>
                <input 
                  type="text" 
                  value={roomId} 
                  onChange={(e) => setRoomId(e.target.value)}
                  placeholder="4-digit code"
                  maxLength={4}
                  className="w-full p-4 bg-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-lg uppercase text-center tracking-[0.5em]"
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-400 uppercase tracking-wider">Choose Character</label>
              <div className="grid grid-cols-4 gap-3">
                {CHARACTERS.map((char) => (
                  <button
                    key={char.name}
                    onClick={() => setSelectedChar(char)}
                    className={`aspect-square text-3xl rounded-xl transition-all ${
                      selectedChar.name === char.name 
                        ? 'ring-4 ring-purple-500 scale-110 bg-slate-600' 
                        : 'bg-slate-700 hover:bg-slate-600'
                    }`}
                  >
                    {char.emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 flex flex-col space-y-3">
              <button 
                onClick={() => handleAction(view === 'create')}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-2xl font-bold text-xl shadow-lg transition-all"
              >
                {view === 'create' ? 'Create Game' : 'Join Game'}
              </button>
              <button 
                onClick={() => setView('main')}
                className="w-full py-2 text-slate-400 hover:text-white transition-colors"
              >
                Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
