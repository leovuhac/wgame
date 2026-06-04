/**
 * Core Types and Interfaces for Airplane Shooter Webgame Online
 * Shared across Client, Server, and Admin
 */

// ============ Enums ============

export enum PlayerStatus {
  ACTIVE = 'ACTIVE',
  BANNED = 'BANNED',
  SUSPENDED = 'SUSPENDED',
  LOCKED = 'LOCKED'
}

export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAW = 'WITHDRAW',
  WIN = 'WIN',
  LOSE = 'LOSE',
  REFUND = 'REFUND'
}

export enum PaymentMethod {
  VIETCOMBANK = 'VIETCOMBANK',
  TECHCOMBANK = 'TECHCOMBANK',
  MOMO = 'MOMO',
  ZALOPAY = 'ZALOPAY'
}

export enum RoomType {
  NORMAL_ROOM = 'NORMAL_ROOM',
  VIP_ROOM = 'VIP_ROOM',
  TOURNAMENT_ROOM = 'TOURNAMENT_ROOM'
}

export enum AirplaneType {
  FIGHTER = 'FIGHTER',           // High speed, low health
  BOMBER = 'BOMBER',             // Slow, high health
  SCOUT = 'SCOUT',               // Small, hard to hit
  STEALTH = 'STEALTH',           // Appears randomly
  CARRIER = 'CARRIER',           // Carries smaller planes
  ARMORED = 'ARMORED',           // High armor, needs piercing bullets
  SPEEDER = 'SPEEDER',           // Very fast, quick appearance
  SHIELD_PLANE = 'SHIELD_PLANE', // Has protective shield
  HEALING_PLANE = 'HEALING_PLANE', // Heals nearby planes
  DECOY_PLANE = 'DECOY_PLANE',   // Creates fake copies
  DRAGON = 'DRAGON'              // Special plane with unique mechanics
}

export enum BossType {
  MINI_BOSS = 'MINI_BOSS',
  MEGA_BOSS = 'MEGA_BOSS',
  JACKPOT_BOSS = 'JACKPOT_BOSS'
}

export enum BulletType {
  NORMAL = 'NORMAL',
  PIERCING = 'PIERCING',
  FIRE = 'FIRE',
  ELECTRIC = 'ELECTRIC',
  ICE = 'ICE'
}

export enum PromotionType {
  DEPOSIT_BONUS = 'DEPOSIT_BONUS',
  CASHBACK = 'CASHBACK',
  FREE_CREDIT = 'FREE_CREDIT',
  MULTIPLIER = 'MULTIPLIER',
  JACKPOT_BOOST = 'JACKPOT_BOOST'
}

export enum KYCStatus {
  NOT_STARTED = 'NOT_STARTED',
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED'
}

export enum Platform {
  WEB = 'WEB',
  IOS = 'IOS',
  ANDROID = 'ANDROID'
}

// ============ Core Interfaces ============

export interface DeviceInfo {
  platform: Platform;
  deviceId: string;
  userAgent: string;
  lastAccessAt: Date;
}

export interface Player {
  _id?: string;
  username: string;
  email: string;
  passwordHash: string;
  status: PlayerStatus;
  balance: number;
  frozenBalance: number;
  totalDeposit: number;
  totalWithdraw: number;
  totalWin: number;
  totalLose: number;
  level: number;
  experience: number;
  kycStatus: KYCStatus;
  kycVerified: boolean;
  devices: DeviceInfo[];
  preferredLanguage: string;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  failedLoginAttempts?: number;
  lockedUntil?: Date;
}

export interface Transaction {
  _id?: string;
  playerId: string;
  type: TransactionType;
  amount: number;
  balance: number;
  frozenBalance: number;
  method?: PaymentMethod;
  orderId?: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GameRoom {
  _id?: string;
  name: string;
  type: RoomType;
  minBet: number;
  maxBet: number;
  maxPlayers: number;
  currentPlayers: string[];
  status: 'OPEN' | 'FULL' | 'CLOSED';
  createdAt: Date;
  updatedAt: Date;
}

export interface Airplane {
  _id?: string;
  type: AirplaneType;
  health: number;
  maxHealth: number;
  speed: number;
  position: Vector3;
  rotation: Vector3;
  reward: number;
  difficulty: number;
}

export interface Boss extends Airplane {
  bossType: BossType;
  phase: number;
  maxPhase: number;
  jackpotActivated: boolean;
}

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface GameState {
  roomId: string;
  playerId: string;
  score: number;
  health: number;
  ammo: number;
  currentBulletType: BulletType;
  airplanes: Airplane[];
  boss?: Boss;
  powerUps: PowerUp[];
  deltaTime: number;
}

export interface PowerUp {
  _id?: string;
  type: 'SHIELD' | 'DOUBLE_DAMAGE' | 'RAPID_FIRE' | 'HEALTH_RECOVER';
  position: Vector3;
  duration: number;
  value: number;
}

export interface Promotion {
  _id?: string;
  type: PromotionType;
  title: string;
  description: string;
  bonusAmount: number;
  minDeposit: number;
  maxWinMultiplier: number;
  validFrom: Date;
  validTo: Date;
  active: boolean;
}

export interface AuditLog {
  _id?: string;
  playerId: string;
  action: string;
  details: Record<string, unknown>;
  ipAddress: string;
  deviceInfo: string;
  timestamp: Date;
}

export interface JWTPayload {
  playerId: string;
  username: string;
  email: string;
  iat: number;
  exp: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  player: Partial<Player>;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}
