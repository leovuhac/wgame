/**
 * API Request/Response Types
 */

import { Player, Transaction, GameRoom, Promotion, KYCStatus } from './index';

// ============ Auth API ============

export interface AuthRegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthLoginRequest {
  email: string;
  password: string;
}

export interface AuthLoginResponse {
  token: string;
  refreshToken: string;
  player: PlayerProfile;
}

export interface AuthRefreshRequest {
  refreshToken: string;
}

export interface AuthRefreshResponse {
  token: string;
}

// ============ Player API ============

export interface PlayerProfile {
  _id: string;
  username: string;
  email: string;
  balance: number;
  frozenBalance: number;
  level: number;
  experience: number;
  totalDeposit: number;
  totalWithdraw: number;
  totalWin: number;
  totalLose: number;
  preferredLanguage: string;
  kycStatus: KYCStatus;
}

export interface UpdateProfileRequest {
  preferredLanguage?: string;
  email?: string;
}

export interface GetBalanceResponse {
  balance: number;
  frozenBalance: number;
  totalDeposit: number;
  totalWithdraw: number;
  totalWin: number;
  totalLose: number;
}

// ============ KYC API ============

export interface SubmitKYCRequest {
  fullName: string;
  dateOfBirth: string;
  idNumber: string;
  idType: 'PASSPORT' | 'ID_CARD' | 'DRIVER_LICENSE';
  address: string;
  frontIdImage: string; // Base64
  backIdImage?: string; // Base64
}

export interface GetKYCStatusResponse {
  status: KYCStatus;
  submittedAt?: Date;
  verifiedAt?: Date;
  rejectionReason?: string;
}

// ============ Room API ============

export interface ListRoomsResponse {
  rooms: RoomInfo[];
}

export interface RoomInfo {
  _id: string;
  name: string;
  type: string;
  minBet: number;
  maxBet: number;
  currentPlayers: number;
  maxPlayers: number;
  status: 'OPEN' | 'FULL' | 'CLOSED';
}

export interface JoinRoomRequest {
  roomId: string;
  betAmount: number;
}

export interface JoinRoomResponse {
  roomId: string;
  gameState: any; // GameState type from game
  wsUrl: string;
  wsToken: string;
}

// ============ Transaction API ============

export interface ListTransactionsRequest {
  page: number;
  pageSize: number;
  type?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export interface ListTransactionsResponse {
  transactions: Transaction[];
  total: number;
  page: number;
  pageSize: number;
}

export interface DepositRequest {
  amount: number;
  method: string;
  returnUrl: string;
}

export interface DepositResponse {
  orderId: string;
  paymentUrl: string;
  expiresAt: Date;
}

export interface WithdrawRequest {
  amount: number;
  method: string;
  bankAccount?: {
    accountName: string;
    accountNumber: string;
    bankCode: string;
  };
  momoPhone?: string;
}

export interface WithdrawResponse {
  orderId: string;
  status: string;
  processedAt?: Date;
}

export interface GetTransactionRequest {
  orderId: string;
}

// ============ Promotion API ============

export interface ListPromotionsResponse {
  promotions: Promotion[];
}

export interface ClaimPromotionRequest {
  promotionId: string;
}

export interface ClaimPromotionResponse {
  promotionId: string;
  bonusAmount: number;
  claimedAt: Date;
}

// ============ Leaderboard API ============

export interface GetLeaderboardRequest {
  type: 'GLOBAL' | 'WEEKLY' | 'MONTHLY';
  page: number;
  pageSize: number;
}

export interface LeaderboardEntry {
  rank: number;
  playerId: string;
  username: string;
  score: number;
  wins: number;
  totalReward: number;
  level: number;
}

export interface GetLeaderboardResponse {
  entries: LeaderboardEntry[];
  total: number;
  yourRank?: number;
}

// ============ Admin API ============

export interface AdminGetStatsRequest {
  startDate?: string;
  endDate?: string;
  interval?: 'DAILY' | 'WEEKLY' | 'MONTHLY';
}

export interface AdminStatsResponse {
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  totalWithdraws: number;
  netRevenue: number;
  avgBetAmount: number;
  jackpotTriggered: number;
  data: Array<{
    date: string;
    revenue: number;
    withdraws: number;
    users: number;
  }>;
}

export interface AdminGetPlayersRequest {
  page: number;
  pageSize: number;
  status?: string;
  search?: string;
}

export interface AdminPlayersResponse {
  players: Array<Player & { lastActivity: Date }>;
  total: number;
  page: number;
  pageSize: number;
}

// ============ Error Response ============

export interface ErrorResponse {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: Date;
}
