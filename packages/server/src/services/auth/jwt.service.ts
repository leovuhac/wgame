/**
 * JWT Authentication Service
 * Handles token generation, validation, and refresh logic
 */

import { JWTPayload } from '@wgame/shared';

export interface JWTConfig {
  secret: string;
  refreshSecret: string;
  expiresIn: string; // e.g., '24h'
  refreshExpiresIn: string; // e.g., '7d'
}

export interface TokenPair {
  token: string;
  refreshToken: string;
}

export class JWTService {
  private config: JWTConfig;
  private revokedTokens: Set<string> = new Set();

  constructor(config: JWTConfig) {
    this.config = config;
  }

  /**
   * Generate JWT token pair (access + refresh)
   */
  public generateTokenPair(payload: Omit<JWTPayload, 'iat' | 'exp'>): TokenPair {
    // In actual implementation with jsonwebtoken:
    // const accessToken = jwt.sign(
    //   payload,
    //   this.config.secret,
    //   { expiresIn: this.config.expiresIn }
    // );
    // const refreshToken = jwt.sign(
    //   { playerId: payload.playerId },
    //   this.config.refreshSecret,
    //   { expiresIn: this.config.refreshExpiresIn }
    // );

    // Mock implementation for now
    const now = Math.floor(Date.now() / 1000);
    const accessToken = this.createMockToken({
      ...payload,
      iat: now,
      exp: now + 86400, // 24 hours
    });
    const refreshToken = this.createMockToken({
      playerId: payload.playerId,
      iat: now,
      exp: now + 604800, // 7 days
    });

    console.log('✅ Generated token pair for player:', payload.playerId);
    return { token: accessToken, refreshToken };
  }

  /**
   * Verify and decode JWT token
   */
  public verifyToken(token: string): JWTPayload | null {
    try {
      // Check if token is revoked
      if (this.revokedTokens.has(token)) {
        console.warn('⚠️  Token has been revoked');
        return null;
      }

      // In actual implementation:
      // const decoded = jwt.verify(token, this.config.secret);
      // return decoded as JWTPayload;

      // Mock implementation
      const decoded = this.decodeMockToken(token);
      if (!decoded) {
        console.warn('⚠️  Invalid token signature');
        return null;
      }

      const now = Math.floor(Date.now() / 1000);
      if (decoded.exp < now) {
        console.warn('⚠️  Token has expired');
        return null;
      }

      return decoded as JWTPayload;
    } catch (error) {
      console.error('❌ Token verification failed:', error);
      return null;
    }
  }

  /**
   * Refresh token - accepts expired access token + refresh token
   */
  public refreshToken(refreshToken: string, expiredAccessToken?: string): TokenPair | null {
    try {
      // In actual implementation:
      // const decoded = jwt.verify(refreshToken, this.config.refreshSecret);
      // return this.generateTokenPair({
      //   playerId: decoded.playerId,
      //   // Additional fields would be fetched from DB
      // });

      // Mock implementation
      const now = Math.floor(Date.now() / 1000);
      const decoded = this.decodeMockToken(refreshToken);

      if (!decoded) {
        console.warn('⚠️  Invalid refresh token');
        return null;
      }

      if (decoded.exp < now - 300) {
        // Allow 5 minute grace period for expired tokens
        console.warn('⚠️  Refresh token expired');
        return null;
      }

      // Revoke old token if provided
      if (expiredAccessToken) {
        this.revokeToken(expiredAccessToken);
      }

      const newTokenPair = this.generateTokenPair({
        playerId: decoded.playerId,
        username: 'username',
        email: 'email',
      });

      console.log('✅ Token refreshed successfully');
      return newTokenPair;
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      return null;
    }
  }

  /**
   * Revoke a token (add to blacklist)
   */
  public revokeToken(token: string): void {
    this.revokedTokens.add(token);
    console.log('✅ Token revoked');

    // In production, this should use Redis with TTL equal to token expiry
    // await redisClient.setEx(`revoked_token:${token}`, ttl, '1');
  }

  /**
   * Check if token is revoked
   */
  public isTokenRevoked(token: string): boolean {
    return this.revokedTokens.has(token);
  }

  /**
   * Clear revoked tokens (would be called periodically)
   */
  public clearRevokedTokens(): void {
    const now = Math.floor(Date.now() / 1000);
    // In real implementation, only clear if token expiry has passed
    console.log('Clearing expired revoked tokens');
    this.revokedTokens.clear();
  }

  /**
   * Helper to create mock token (for demo purposes)
   */
  private createMockToken(payload: JWTPayload): string {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString(
      'base64url'
    );
    const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = 'mock_signature';
    return `${header}.${body}.${signature}`;
  }

  /**
   * Helper to decode mock token
   */
  private decodeMockToken(token: string): JWTPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }
      const payload = Buffer.from(parts[1], 'base64url').toString();
      return JSON.parse(payload) as JWTPayload;
    } catch {
      return null;
    }
  }
}

/**
 * Middleware to check JWT in headers
 */
export function createAuthMiddleware(jwtService: JWTService) {
  return (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Missing or invalid authorization header',
        },
      });
    }

    const token = authHeader.substring(7);
    const payload = jwtService.verifyToken(token);

    if (!payload) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Token verification failed',
        },
      });
    }

    req.user = payload;
    next();
  };
}
