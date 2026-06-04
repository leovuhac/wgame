# Getting Started with Airplane Shooter Webgame

## 🎮 Project Overview

Airplane Shooter Webgame Online is a **multi-platform (Web, iOS, Android) real-time multiplayer 3D shooting game** with:

- ✈️ Multiple airplane types with unique mechanics
- 💰 Integrated payment system (Vietnamese banks + digital wallets)
- 🎁 Jackpot/Nổ hũ system for big wins
- 🏆 Real-time leaderboards
- 👥 Multi-player synchronization
- 🛡️ Enterprise-grade security

## 📦 What's Been Built (Phase 1-3)

### ✅ Foundation (Phase 1)
- **Monorepo Structure**: 4 independent packages with shared types
- **Type Safety**: Full TypeScript with strict mode
- **Development Tools**: ESLint, Prettier, Jest configured
- **Core Types**: 50+ interfaces covering all game entities

### ✅ Data Layer (Phase 2)
- **MongoDB**: Player profiles, game rooms, airplanes
- **PostgreSQL**: Financial transactions (append-only for compliance)
- **Redis**: Sessions, leaderboards, caching
- **Connection Pooling**: With exponential backoff retry logic

### ✅ Authentication (Phase 3)
- **JWT Tokens**: 24-hour access + 7-day refresh tokens
- **Registration**: Comprehensive input validation
- **Login**: Credential verification ready
- **Token Management**: Refresh, revoke, and blacklist system

## 🚀 Quick Setup

### Prerequisites

```bash
# System requirements
- Node.js 20+
- npm or pnpm
- MongoDB (local or Atlas)
- PostgreSQL 12+
- Redis 6+
```

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Create environment file
cp packages/server/.env.example packages/server/.env

# 3. Edit .env with your configuration
# Required:
#   - MONGO_URL (MongoDB connection)
#   - DB_HOST, DB_PORT, DB_USER, DB_PASSWORD (PostgreSQL)
#   - REDIS_URL (Redis connection)
#   - JWT_SECRET, JWT_REFRESH_SECRET (generate random strings)
```

### Running Development Servers

```bash
# All in one command (parallel)
npm run dev

# Or run individual packages:
cd packages/server && npm run dev
cd packages/client && npm run dev
cd packages/admin && npm run dev
```

### Running Tests

```bash
# All tests
npm test

# Watch mode
npm test -- --watch

# Coverage report
npm test -- --coverage
```

## 📁 Project Structure

```
wgame/
├── packages/
│   ├── shared/               # Shared types across all packages
│   │   └── src/types/
│   │       ├── index.ts     # Core types (Player, Room, etc.)
│   │       ├── events.ts    # WebSocket events
│   │       └── api.ts       # REST API types
│   │
│   ├── server/               # Game Server (Node.js + Express)
│   │   └── src/
│   │       ├── db/
│   │       │   ├── mongo/   # MongoDB connection & schemas
│   │       │   ├── postgres/ # PostgreSQL migrations
│   │       │   └── redis/   # Redis managers
│   │       └── services/
│   │           ├── auth/    # JWT & Authentication
│   │           ├── player/  # Player profiles & KYC
│   │           ├── game/    # Game logic (to build)
│   │           └── audit/   # Security logging
│   │
│   ├── client/               # Game Client (React + Three.js)
│   │   └── src/
│   │       ├── components/
│   │       ├── pages/
│   │       ├── services/
│   │       └── hooks/
│   │
│   └── admin/                # Admin Panel (React + Ant Design)
│       └── src/
│           ├── components/
│           ├── pages/
│           └── services/
│
├── DEVELOPMENT.md            # Development roadmap
├── PROGRESS.md              # Current progress tracking
└── README.md                # Project overview
```

## 🏗️ Architecture Overview

### Three-Tier Architecture

```
┌─────────────────────────────────────────────────┐
│              Game Clients (Web/iOS/Android)      │
│                  Three.js + React               │
└─────────────────┬───────────────────────────────┘
                  │ WebSocket + REST API
┌─────────────────┴───────────────────────────────┐
│            Game Server (Node.js)                │
│   - WebSocket for real-time sync               │
│   - REST API for auth & profiles               │
│   - Game loop & physics                        │
└─────────────────┬───────────────────────────────┘
                  │
      ┌───────────┼───────────┐
      │           │           │
   MongoDB    PostgreSQL    Redis
  (Players)   (Financial)  (Cache)
```

### Data Flow

```
User Registration
  ↓
[AuthService.register()]
  ↓
Hash password (bcrypt)
  ↓
[MongoDBConnection.insertPlayer()]
  ↓
[AuditService.log()] → PostgreSQL
  ↓
Return confirmation

User Login
  ↓
[AuthService.login()]
  ↓
[PlayerRepository.findByEmail()]
  ↓
Verify password
  ↓
[JWTService.generateTokenPair()]
  ↓
[SessionManager.setSession()] → Redis
  ↓
[AuditService.log()]
  ↓
Return token + player profile
```

## 🔐 Security Features

✅ **Implemented**
- JWT with secure token pairs
- Bcrypt password hashing (salt rounds: 12)
- Token revocation/blacklist
- Input validation and sanitization
- Append-only audit logs

🟡 **In Progress**
- Account lockout after 5 failed attempts
- Rate limiting
- CORS configuration
- AES-256 encryption for sensitive data

## 📊 Database Schema Quick Reference

### MongoDB Collections
- **Players**: User accounts, profiles, KYC
- **GameRooms**: Room configurations
- **Airplanes**: Enemy types and properties
- **Promotions**: Bonus offerings

### PostgreSQL Tables
- **transactions**: All financial operations (append-only)
- **audit_logs**: Security events (append-only)
- **deposit_orders**: Deposit tracking
- **withdraw_orders**: Withdrawal tracking

### Redis Keys
- `session:{playerId}`: Player session data (24h TTL)
- `leaderboard:{type}`: Sorted set of rankings
- `cache:{key}`: Generic cache storage

## 🛠️ Common Tasks

### Add a New Endpoint

```typescript
// 1. Define types in packages/shared/src/types/api.ts
export interface MyEndpointRequest {
  data: string;
}

// 2. Create service in packages/server/src/services/
export class MyService {
  async doSomething(input: MyEndpointRequest) {
    // Implementation
  }
}

// 3. Add route in packages/server/src/api/
app.post('/api/endpoint', (req, res) => {
  const service = new MyService();
  const result = await service.doSomething(req.body);
  res.json(result);
});
```

### Add a New Type

```typescript
// In packages/shared/src/types/index.ts
export interface MyType {
  id: string;
  name: string;
  // ... fields
}

// Use in any package
import { MyType } from '@wgame/shared';
```

### Run Linting

```bash
npm run lint           # Check all packages
npm run lint -- --fix # Auto-fix issues
```

### Format Code

```bash
npm run format         # Format all files
npm run format:check  # Check formatting
```

## 📈 Development Roadmap

**Phase 4** (Next): Game Engine & WebSocket
- Room management
- Airplane spawning
- Real-time synchronization
- Collision detection

**Phase 5**: Three.js Client
- 3D scene setup
- Game UI
- Input handling
- Asset loading

**Phase 6**: Payment Integration
- Vietcombank API
- MoMo wallet
- Transaction management

**Phase 7**: Admin Panel
- Dashboard
- Player management
- Revenue reports

**Phase 8**: Testing & Optimization
- Unit tests
- Integration tests
- Load testing
- Performance tuning

## 📚 Key Files to Know

| File | Purpose |
|------|---------|
| `packages/shared/src/types/index.ts` | All core game types |
| `packages/shared/src/types/events.ts` | WebSocket event definitions |
| `packages/server/src/services/auth/` | Authentication logic |
| `packages/server/src/db/` | Database connections |
| `DEVELOPMENT.md` | Detailed roadmap |
| `PROGRESS.md` | Current status |

## 🐛 Troubleshooting

### MongoDB Connection Fails
```bash
# Check connection string
echo $MONGO_URL

# Test connection
mongosh $MONGO_URL
```

### PostgreSQL Migrations Don't Run
```bash
# Check PostgreSQL is running
psql -h $DB_HOST -U $DB_USER -d $DB_NAME

# View migration status
npm run migrate:status
```

### Redis Connection Issues
```bash
# Test connection
redis-cli -u $REDIS_URL ping

# Should output: PONG
```

## 📞 Getting Help

- Check `PROGRESS.md` for current status
- Review existing services in `packages/server/src/services/`
- Look at types in `packages/shared/src/types/`
- Check recent commits for implementation examples

## 🎯 Next Steps

1. **Implement Account Lockout** (Req 1.4)
   - Track failed attempts in Redis
   - Lock for 15 minutes after 5 failures

2. **Add Audit Logging** (Req 1.7)
   - Log all auth events
   - Store to PostgreSQL

3. **Build Auth Tests**
   - Unit tests for validation
   - Property tests for lockout
   - Integration tests for flow

4. **Create Game Server**
   - Socket.io setup
   - Game room management
   - Real-time synchronization

## 📝 Notes

- This is a **monorepo** - code is in `packages/` subdirectories
- All types are shared through `@wgame/shared` package
- Use `npm install` not `cd packages && npm install`
- Prettier + ESLint will auto-fix most formatting issues
- All services should be async-ready for database operations

---

**Happy Coding! 🚀** Go build something awesome!
