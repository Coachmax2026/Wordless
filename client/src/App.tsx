import React, { useState, useEffect, useRef } from 'react';
import { GameState, Player, Phase } from './types';
import Home from './components/Home';
import Lobby from './components/Lobby';
import Game from './components/Game';
import Vote from './components/Vote';
import Results from './components/Results';
import PaymentSuccess from './components/PaymentSuccess';
import { getUnlockedCategories } from './utils/purchases';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  if (window.location.pathname === '/payment-success') {
    return <PaymentSuccess />;
  }

  useEffect(() => {
    // Only connect if we have a reason to (e.g. joined a room)
    // But for simplicity, we'll connect when we join/create
  }, []);

  const connect = (roomId: string, playerName: string, character: string, color: string, isCreate: boolean) => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const socket = new WebSocket(`${protocol}//${window.location.host}`);
    socketRef.current = socket;

    socket.onopen = () => {
      if (isCreate) {
        socket.send(JSON.stringify({
          type: 'CREATE_ROOM',
          payload: { playerName, character, color }
        }));
      } else {
        socket.send(JSON.stringify({
          type: 'JOIN_ROOM',
          payload: { roomId, playerName, character, color }
        }));
      }
    };

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'GAME_STATE') {
        setGameState(message.state);
        // Find our own player ID from the state if not set
        if (!playerId) {
           // This is tricky because names aren't unique. 
           // In a real app, the server would send a 'WELCOME' message with your ID.
           // Let's modify the server to do that.
        }
      } else if (message.type === 'ROOM_CREATED') {
        // Room created, state will follow
      } else if (message.type === 'YOUR_ID') {
        setPlayerId(message.id);
      } else if (message.type === 'ERROR') {
        alert(message.message);
        socket.close();
      }
    };

    socket.onclose = () => {
      setGameState(null);
      setPlayerId(null);
    };
  };

  const startGame = () => {
    const categories = getUnlockedCategories();
    socketRef.current?.send(JSON.stringify({ 
      type: 'START_GAME',
      payload: { categories }
    }));
  };

  const submitVote = (votedPlayerId: string) => {
    socketRef.current?.send(JSON.stringify({
      type: 'SUBMIT_VOTE',
      payload: { votedPlayerId }
    }));
  };

  const restartGame = () => {
    socketRef.current?.send(JSON.stringify({ type: 'RESTART_GAME' }));
  };

  const updateSettings = (settings: any) => {
    socketRef.current?.send(JSON.stringify({
      type: 'UPDATE_SETTINGS',
      payload: { settings }
    }));
  };

  if (!gameState) {
    return <Home onJoin={(roomId, name, char, color) => connect(roomId, name, char, color, false)} 
                 onCreate={(name, char, color) => connect('', name, char, color, true)} />;
  }

  const me = gameState.players.find(p => p.id === playerId);

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans p-4">
      {gameState.phase === 'lobby' && (
        <Lobby gameState={gameState} me={me} onStart={startGame} onUpdateSettings={updateSettings} />
      )}
      {gameState.phase === 'discussion' && (
        <Game gameState={gameState} me={me} />
      )}
      {gameState.phase === 'voting' && (
        <Vote gameState={gameState} me={me} onVote={submitVote} />
      )}
      {gameState.phase === 'results' && (
        <Results gameState={gameState} me={me} onRestart={restartGame} />
      )}
    </div>
  );
};

export default App;
