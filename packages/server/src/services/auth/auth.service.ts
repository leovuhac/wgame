/**
 * Authentication Service
 * Handles user registration, login, and account management
 */

import {
  Player,
  PlayerStatus,
  AuthLoginRequest,
  AuthRegisterRequest,
  LoginResponse,
} from '@wgame/shared';
import { JWTService, TokenPair } from './jwt.service';

export interface RegisterOptions {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginOptions {
  email: string;
  password: string;
}

export class AuthService {
  private jwtService: JWTService;
  // In real implementation, would inject:
  // private playerRepository: PlayerRepository;
  // private auditService: AuditService;

  constructor(jwtService: JWTService) {
    this.jwtService = jwtService;
  }

  /**
   * Validate registration input
   */
  private validateRegistrationInput(input: RegisterOptions): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Username validation
    if (input.username.length < 4 || input.username.length > 32) {
      errors.push('Username must be between 4 and 32 characters');
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(input.username)) {
      errors.push('Username can only contain letters, numbers, underscores, and hyphens');
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(input.email)) {
      errors.push('Invalid email format');
    }

    // Password validation
    if (input.password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }
    if (input.password !== input.confirmPassword) {
      errors.push('Passwords do not match');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Register new player
   */
  public async register(input: RegisterOptions): Promise<{
    success: boolean;
    message: string;
    playerId?: string;
    error?: { code: string; message: string };
  }> {
    try {
      // Validate input
      const validation = this.validateRegistrationInput(input);
      if (!validation.valid) {
        return {
          success: false,
          message: 'Validation failed',
          error: {
            code: 'VALIDATION_ERROR',
            message: validation.errors.join('; '),
          },
        };
      }

      // Check if username already exists
      // In real implementation:
      // const existingUser = await this.playerRepository.findByUsername(input.username);
      // if (existingUser) {
      //   return { success: false, message: 'Username already taken', ...};
      // }

      // Check if email already exists
      // if (await this.playerRepository.findByEmail(input.email)) {
      //   return { success: false, message: 'Email already registered', ...};
      // }

      // Hash password
      // In real implementation: const passwordHash = await bcrypt.hash(input.password, 12);

      // Create player record
      // const player = await this.playerRepository.create({
      //   username: input.username,
      //   email: input.email,
      //   passwordHash,
      //   status: PlayerStatus.ACTIVE,
      // });

      // Log audit event
      // await this.auditService.log({
      //   action: 'USER_REGISTERED',
      //   playerId: player._id,
      //   ...
      // });

      console.log('✅ Player registered successfully:', input.username);

      return {
        success: true,
        message: 'Registration successful',
        playerId: 'mock_player_id', // In real: player._id.toString()
      };
    } catch (error) {
      console.error('❌ Registration failed:', error);
      return {
        success: false,
        message: 'Registration failed',
        error: {
          code: 'REGISTRATION_ERROR',
          message: 'An error occurred during registration',
        },
      };
    }
  }

  /**
   * Login player
   */
  public async login(input: LoginOptions): Promise<{
    success: boolean;
    data?: LoginResponse;
    error?: { code: string; message: string };
  }> {
    try {
      // Validate input
      if (!input.email || !input.password) {
        return {
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Email and password are required',
          },
        };
      }

      // Find player by email
      // In real implementation:
      // const player = await this.playerRepository.findByEmail(input.email);
      // if (!player) {
      //   return { success: false, error: {...} };
      // }

      // Check account status
      // if (player.status === PlayerStatus.BANNED) {
      //   return { success: false, error: {...} };
      // }
      // if (player.status === PlayerStatus.LOCKED) {
      //   if (player.lockedUntil && player.lockedUntil > new Date()) {
      //     return { success: false, error: {...} };
      //   }
      // }

      // Verify password
      // In real implementation: const isValidPassword = await bcrypt.compare(input.password, player.passwordHash);
      // if (!isValidPassword) {
      //   // Increment failed attempts
      //   // Log attempt
      //   return { success: false, error: {...} };
      // }

      // Generate tokens
      // In real implementation:
      // const tokenPair = this.jwtService.generateTokenPair({
      //   playerId: player._id.toString(),
      //   username: player.username,
      //   email: player.email,
      // });

      // Reset failed attempts
      // Update last login
      // Log audit event

      console.log('✅ Player logged in:', input.email);

      const mockTokenPair = this.jwtService.generateTokenPair({
        playerId: 'mock_player_id',
        username: 'mock_username',
        email: input.email,
      });

      return {
        success: true,
        data: {
          ...mockTokenPair,
          player: {
            _id: 'mock_player_id',
            username: 'mock_username',
            email: input.email,
            balance: 0,
            frozenBalance: 0,
            level: 1,
            experience: 0,
            totalDeposit: 0,
            totalWithdraw: 0,
            totalWin: 0,
            totalLose: 0,
            preferredLanguage: 'vi',
            kycStatus: 'NOT_STARTED',
          },
        },
      };
    } catch (error) {
      console.error('❌ Login failed:', error);
      return {
        success: false,
        error: {
          code: 'LOGIN_ERROR',
          message: 'Login failed',
        },
      };
    }
  }

  /**
   * Logout player - revoke tokens
   */
  public async logout(token: string): Promise<void> {
    try {
      this.jwtService.revokeToken(token);
      console.log('✅ Player logged out');
    } catch (error) {
      console.error('❌ Logout failed:', error);
      throw error;
    }
  }

  /**
   * Refresh access token
   */
  public async refreshToken(
    refreshToken: string,
    expiredAccessToken?: string
  ): Promise<{
    success: boolean;
    data?: TokenPair;
    error?: { code: string; message: string };
  }> {
    try {
      const newTokenPair = this.jwtService.refreshToken(refreshToken, expiredAccessToken);

      if (!newTokenPair) {
        return {
          success: false,
          error: {
            code: 'INVALID_REFRESH_TOKEN',
            message: 'Token refresh failed',
          },
        };
      }

      console.log('✅ Token refreshed successfully');
      return {
        success: true,
        data: newTokenPair,
      };
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      return {
        success: false,
        error: {
          code: 'REFRESH_ERROR',
          message: 'Token refresh failed',
        },
      };
    }
  }
}
