/**
 * MongoDB Mongoose Schema for Player collection
 */

import {
  Player,
  PlayerStatus,
  KYCStatus,
  Platform,
} from '@wgame/shared';

export interface PlayerDocument extends Omit<Player, '_id'> {
  _id?: any;
}

/**
 * Mongoose Schema Definition
 * Note: In actual implementation, this would be:
 *
 * const playerSchema = new Schema<PlayerDocument>({
 *   username: {
 *     type: String,
 *     required: true,
 *     unique: true,
 *     minlength: 4,
 *     maxlength: 32,
 *     lowercase: true,
 *     trim: true,
 *   },
 *   email: {
 *     type: String,
 *     required: true,
 *     unique: true,
 *     lowercase: true,
 *   },
 *   passwordHash: {
 *     type: String,
 *     required: true,
 *     select: false,
 *   },
 *   status: {
 *     type: String,
 *     enum: Object.values(PlayerStatus),
 *     default: PlayerStatus.ACTIVE,
 *   },
 *   balance: { type: Number, default: 0 },
 *   frozenBalance: { type: Number, default: 0 },
 *   totalDeposit: { type: Number, default: 0 },
 *   totalWithdraw: { type: Number, default: 0 },
 *   totalWin: { type: Number, default: 0 },
 *   totalLose: { type: Number, default: 0 },
 *   level: { type: Number, default: 1 },
 *   experience: { type: Number, default: 0 },
 *   kycStatus: {
 *     type: String,
 *     enum: Object.values(KYCStatus),
 *     default: KYCStatus.NOT_STARTED,
 *   },
 *   kycVerified: { type: Boolean, default: false },
 *   devices: [
 *     {
 *       platform: {
 *         type: String,
 *         enum: Object.values(Platform),
 *       },
 *       deviceId: String,
 *       userAgent: String,
 *       lastAccessAt: Date,
 *     },
 *   ],
 *   preferredLanguage: { type: String, default: 'vi' },
 *   createdAt: { type: Date, default: Date.now },
 *   updatedAt: { type: Date, default: Date.now },
 *   lastLoginAt: Date,
 *   failedLoginAttempts: { type: Number, default: 0 },
 *   lockedUntil: Date,
 * });
 *
 * playerSchema.index({ username: 1 }, { unique: true });
 * playerSchema.index({ email: 1 }, { unique: true });
 * playerSchema.index({ createdAt: -1 });
 * playerSchema.index({ updatedAt: -1 });
 *
 * export const PlayerModel = model<PlayerDocument>('Player', playerSchema);
 */

export const playerSchemaConfig = {
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 4,
    maxlength: 32,
    lowercase: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  passwordHash: {
    type: String,
    required: true,
    select: false,
  },
  status: {
    type: String,
    enum: Object.values(PlayerStatus),
    default: PlayerStatus.ACTIVE,
  },
  balance: { type: Number, default: 0 },
  frozenBalance: { type: Number, default: 0 },
  totalDeposit: { type: Number, default: 0 },
  totalWithdraw: { type: Number, default: 0 },
  totalWin: { type: Number, default: 0 },
  totalLose: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  experience: { type: Number, default: 0 },
  kycStatus: {
    type: String,
    enum: Object.values(KYCStatus),
    default: KYCStatus.NOT_STARTED,
  },
  kycVerified: { type: Boolean, default: false },
  devices: [
    {
      platform: {
        type: String,
        enum: Object.values(Platform),
      },
      deviceId: String,
      userAgent: String,
      lastAccessAt: Date,
    },
  ],
  preferredLanguage: { type: String, default: 'vi' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  lastLoginAt: { type: Date },
  failedLoginAttempts: { type: Number, default: 0 },
  lockedUntil: { type: Date },
};

export const playerIndexes = [
  { fields: { username: 1 }, options: { unique: true } },
  { fields: { email: 1 }, options: { unique: true } },
  { fields: { createdAt: -1 }, options: {} },
  { fields: { updatedAt: -1 }, options: {} },
  { fields: { status: 1 }, options: {} },
];
