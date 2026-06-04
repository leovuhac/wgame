/**
 * WebSocket Events - Real-time communication between Client and Server
 */

import { GameState, Airplane, Boss } from './index';

// ============ Server Events (Server → Client) ============

export interface ServerEvents {
  'game:start': (data: { roomId: string; gameState: GameState }) => void;
  'game:update': (data: { gameState: GameState }) => void;
  'game:end': (data: { roomId: string; finalScore: number; reward: number }) => void;
  'airplane:spawn': (data: { airplane: Airplane }) => void;
  'airplane:despawn': (data: { airplaneId: string }) => void;
  'airplane:hit': (data: { airplaneId: string; damage: number; health: number }) => void;
  'airplane:destroyed': (data: { airplaneId: string; reward: number; dropItems: string[] }) => void;
  'boss:appear': (data: { boss: Boss }) => void;
  'boss:hit': (data: { phase: number; health: number }) => void;
  'boss:defeated': (data: { jackpotActivated: boolean; reward: number }) => void;
  'player:damage': (data: { health: number }) => void;
  'player:powerup': (data: { powerUpType: string; duration: number }) => void;
  'player:levelup': (data: { level: number; experience: number }) => void;
  'room:playerJoined': (data: { playerId: string; playerCount: number }) => void;
  'room:playerLeft': (data: { playerId: string; playerCount: number }) => void;
  'room:closed': () => void;
  'leaderboard:update': (data: { leaderboard: LeaderboardEntry[] }) => void;
  'notification:message': (data: { message: string; type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS' }) => void;
  'error': (data: { code: string; message: string }) => void;
}

// ============ Client Events (Client → Server) ============

export interface ClientEvents {
  'game:join': (data: { roomId: string }, callback?: (ack: any) => void) => void;
  'game:leave': () => void;
  'player:move': (data: { position: { x: number; y: number } }) => void;
  'player:shoot': (data: { targetId: string; bulletType: string }) => void;
  'player:changeBullet': (data: { bulletType: string }) => void;
  'player:useSkill': (data: { skillId: string }) => void;
  'player:ready': () => void;
  'player:heartbeat': () => void;
}

// ============ Supporting Types ============

export interface LeaderboardEntry {
  rank: number;
  playerId: string;
  username: string;
  score: number;
  wins: number;
  totalReward: number;
}

export interface RoomUpdate {
  roomId: string;
  playerCount: number;
  status: 'WAITING' | 'PLAYING' | 'ENDING';
}
