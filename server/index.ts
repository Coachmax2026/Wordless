import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import fs from 'fs';
import { GameState, Player, Phase } from './types';
import dotenv from 'dotenv';
import Stripe from 'stripe';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

const app = express();
app.use(express.json());
const server = createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 3000;

// Game State Management
const rooms = new Map<string, GameState>();

const wordsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'words.json'), 'utf-8'));

function generateRoomId() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

function broadcast(roomId: string, message: any) {
  const room = rooms.get(roomId);
  if (!room) return;
  
  const payload = JSON.stringify(message);
  wss.clients.forEach((client: any) => {
    if (client.roomId === roomId && client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

function sendGameState(roomId: string) {
  const room = rooms.get(roomId);
  if (!room) return;
  
  // We might want to mask certain info (like other people's words)
  // But for MVP, let's just send the whole state and handle it on frontend
  // Wait, no, security! Players shouldn't know who the imposter is.
  
  wss.clients.forEach((client: any) => {
    if (client.roomId === roomId && client.readyState === WebSocket.OPEN) {
      const player = room.players.find(p => p.id === client.playerId);
      const maskedPlayers = room.players.map(p => ({
        ...p,
        word: (player?.id === p.id || room.phase === 'results') ? p.word : undefined,
        isImposter: (player?.id === p.id || room.phase === 'results') ? p.isImposter : false,
      }));
      
      client.send(JSON.stringify({
        type: 'GAME_STATE',
        state: { ...room, players: maskedPlayers }
      }));
    }
  });
}

wss.on('connection', (ws: any) => {
  ws.on('message', (data: string) => {
    const message = JSON.parse(data);
    const { type, payload } = message;

    switch (type) {
      case 'JOIN_ROOM': {
        const { roomId, playerName, character, color } = payload;
        const room = rooms.get(roomId);
        if (!room) {
          ws.send(JSON.stringify({ type: 'ERROR', message: 'Room not found' }));
          return;
        }

        const playerId = Math.random().toString(36).substring(7);
        const newPlayer: Player = {
          id: playerId,
          name: playerName,
          character,
          color,
          isHost: room.players.length === 0,
          isImposter: false,
          score: 0
        };

        room.players.push(newPlayer);
        ws.roomId = roomId;
        ws.playerId = playerId;
        
        ws.send(JSON.stringify({ type: 'YOUR_ID', id: playerId }));
        sendGameState(roomId);
        break;
      }

      case 'CREATE_ROOM': {
        const roomId = generateRoomId();
        const { playerName, character, color } = payload;
        const playerId = Math.random().toString(36).substring(7);
        
        const newRoom: GameState = {
          roomId,
          phase: 'lobby',
          players: [{
            id: playerId,
            name: playerName,
            character,
            color,
            isHost: true,
            isImposter: false,
            score: 0
          }],
          timer: 0,
          gameSettings: {
            discussionTime: 60,
            votingTime: 30
          }
        };
        
        rooms.set(roomId, newRoom);
        ws.roomId = roomId;
        ws.playerId = playerId;
        
        ws.send(JSON.stringify({ type: 'ROOM_CREATED', roomId }));
        ws.send(JSON.stringify({ type: 'YOUR_ID', id: playerId }));
        sendGameState(roomId);
        break;
      }

      case 'START_GAME': {
        const room = rooms.get(ws.roomId);
        if (room && room.players.find(p => p.id === ws.playerId)?.isHost) {
          startGame(ws.roomId, payload?.categories);
        }
        break;
      }

      case 'SUBMIT_VOTE': {
        const room = rooms.get(ws.roomId);
        if (room && room.phase === 'voting') {
          const player = room.players.find(p => p.id === ws.playerId);
          if (player) {
            player.vote = payload.votedPlayerId;
            
            // Check if all players voted
            if (room.players.every(p => p.vote)) {
              endVoting(ws.roomId);
            } else {
              sendGameState(ws.roomId);
            }
          }
        }
        break;
      }
      
      case 'RESTART_GAME': {
        const room = rooms.get(ws.roomId);
        if (room && room.players.find(p => p.id === ws.playerId)?.isHost) {
          room.phase = 'lobby';
          room.players.forEach(p => {
            p.vote = undefined;
            p.word = undefined;
            p.isImposter = false;
          });
          sendGameState(ws.roomId);
        }
        break;
      }

      case 'UPDATE_SETTINGS': {
        const room = rooms.get(ws.roomId);
        if (room && room.players.find(p => p.id === ws.playerId)?.isHost) {
          room.gameSettings = {
            ...room.gameSettings,
            ...payload.settings
          };
          sendGameState(ws.roomId);
        }
        break;
      }
    }
  });

  ws.on('close', () => {
    if (ws.roomId) {
      const room = rooms.get(ws.roomId);
      if (room) {
        room.players = room.players.filter(p => p.id !== ws.playerId);
        if (room.players.length === 0) {
          rooms.delete(ws.roomId);
        } else {
          // If host left, assign new host
          if (!room.players.some(p => p.isHost)) {
            room.players[0].isHost = true;
          }
          sendGameState(ws.roomId);
        }
      }
    }
  });
});

function startGame(roomId: string, allowedCategories?: string[]) {
  const room = rooms.get(roomId);
  if (!room) return;

  const allCategories = Object.keys(wordsData);
  const categories = (allowedCategories && allowedCategories.length > 0) 
    ? allCategories.filter(c => allowedCategories.includes(c))
    : ['Everyday Things']; // Fallback to free category
  
  const category = categories[Math.floor(Math.random() * categories.length)];
  const wordPairs = wordsData[category];
  const pair = wordPairs[Math.floor(Math.random() * wordPairs.length)];
  
  const imposterIndex = Math.floor(Math.random() * room.players.length);
  const [normalWord, imposterWord] = Math.random() > 0.5 ? pair : [pair[1], pair[0]];

  room.category = category;
  room.players.forEach((player, index) => {
    player.isImposter = index === imposterIndex;
    player.word = player.isImposter ? imposterWord : normalWord;
    player.vote = undefined;
  });

  room.phase = 'discussion';
  room.timer = room.gameSettings.discussionTime;
  sendGameState(roomId);

  const interval = setInterval(() => {
    const r = rooms.get(roomId);
    if (!r || r.phase !== 'discussion') {
      clearInterval(interval);
      return;
    }
    
    r.timer--;
    if (r.timer <= 0) {
      r.phase = 'voting';
      r.timer = r.gameSettings.votingTime;
      sendGameState(roomId);
      clearInterval(interval);
      startVotingTimer(roomId);
    } else {
      // Send timer update periodically? Maybe just let clients count down but sync occasionally
      if (r.timer % 10 === 0) sendGameState(roomId);
    }
  }, 1000);
}

function startVotingTimer(roomId: string) {
  const interval = setInterval(() => {
    const r = rooms.get(roomId);
    if (!r || r.phase !== 'voting') {
      clearInterval(interval);
      return;
    }
    
    r.timer--;
    if (r.timer <= 0) {
      endVoting(roomId);
      clearInterval(interval);
    } else {
       if (r.timer % 5 === 0) sendGameState(roomId);
    }
  }, 1000);
}

function endVoting(roomId: string) {
  const room = rooms.get(roomId);
  if (!room) return;

  room.phase = 'results';
  
  // Calculate winner
  const voteCounts: Record<string, number> = {};
  room.players.forEach(p => {
    if (p.vote) {
      voteCounts[p.vote] = (voteCounts[p.vote] || 0) + 1;
    }
  });

  let maxVotes = 0;
  let votedOutPlayerId: string | null = null;
  
  Object.entries(voteCounts).forEach(([id, count]) => {
    if (count > maxVotes) {
      maxVotes = count;
      votedOutPlayerId = id;
    } else if (count === maxVotes) {
      votedOutPlayerId = null; // Tie
    }
  });

  const imposter = room.players.find(p => p.isImposter);
  if (votedOutPlayerId === imposter?.id) {
    room.winner = 'players';
  } else {
    room.winner = 'imposter';
  }

  sendGameState(roomId);
}

// Stripe Endpoints
app.post('/api/create-checkout-session', async (req, res) => {
  const { categoryName, price } = req.body;
  const origin = req.headers.origin || `http://${req.headers.host}`;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Wordless: ${categoryName} Pack`,
            },
            unit_amount: price,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}&category=${encodeURIComponent(categoryName)}`,
      cancel_url: `${origin}/`,
    });

    res.json({ url: session.url });
  } catch (err: any) {
    console.error('Stripe Error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/verify-purchase', async (req, res) => {
  const { sessionId } = req.body;

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status === 'paid') {
      // In a real app, you'd find the category from the session metadata or success_url
      // Here we trust the frontend passed it originally, and we can retrieve it if we saved it in metadata.
      // Let's assume the session has it in success_url as a param (already done above)
      // and we just verify it was paid.
      res.json({ verified: true });
    } else {
      res.json({ verified: false });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/dist')));

app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on http://0.0.0.0:${PORT}`);
});
