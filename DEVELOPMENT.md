# Airplane Shooter Webgame Online - Development Plan

## Phase 1: Foundation & Infrastructure (Week 1)

### Task 1.1: Project Setup ✅ COMPLETED
- [x] Create monorepo structure with packages: server, client, admin, shared
- [x] Configure TypeScript with strict mode across all packages
- [x] Setup ESLint and Prettier for code quality
- [x] Configure Jest for testing
- [x] Create core types and interfaces in shared package
- [x] Define WebSocket events schema
- [x] Define REST API request/response types

### Task 1.2: Data Layer Setup (In Progress)
- [ ] MongoDB connection & Mongoose schemas
  - [ ] Player schema
  - [ ] Room schema
  - [ ] Airplane & Boss schemas
  - [ ] Promotion schema
- [ ] PostgreSQL connection & migrations
  - [ ] Transactions (append-only)
  - [ ] Audit logs (append-only)
  - [ ] Deposit/Withdraw orders
- [ ] Redis Cluster setup
  - [ ] Session management
  - [ ] Leaderboard with Sorted Sets
  - [ ] Cache utilities

### Task 1.3: Authentication Service
- [ ] User registration with validation
- [ ] User login with JWT generation
- [ ] Password hashing with bcrypt
- [ ] Token refresh mechanism
- [ ] Account lockout after failed attempts
- [ ] Audit logging for all auth events

---

## Phase 2: Core Game Engine (Week 2)

### Task 2.1: Game Server Architecture
- [ ] Express.js REST API setup
- [ ] Socket.io WebSocket server
- [ ] Game room management
- [ ] Player state management
- [ ] Game loop implementation

### Task 2.2: Game Mechanics
- [ ] Airplane spawning system
- [ ] Boss encounter system
- [ ] Collision detection
- [ ] Damage calculation
- [ ] Reward system
- [ ] Power-up mechanics

### Task 2.3: Real-time Synchronization
- [ ] WebSocket event handlers
- [ ] State consistency across clients
- [ ] Latency compensation
- [ ] Spectator mode

---

## Phase 3: Financial System (Week 3)

### Task 3.1: Payment Integration
- [ ] Vietcombank API integration
- [ ] MoMo wallet integration
- [ ] ZaloPay integration
- [ ] Deposit flow
- [ ] Withdrawal flow

### Task 3.2: Transaction Management
- [ ] Balance tracking
- [ ] Frozen balance for pending transactions
- [ ] Transaction history
- [ ] Audit trail
- [ ] Refund handling

### Task 3.3: KYC Verification
- [ ] KYC submission flow
- [ ] Document validation
- [ ] Verification status tracking
- [ ] Tier-based transaction limits

---

## Phase 4: Game Client (Three.js) (Week 4)

### Task 4.1: 3D Graphics Foundation
- [ ] Three.js scene setup
- [ ] Camera and lighting
- [ ] Model loading and animation
- [ ] Particle systems for effects

### Task 4.2: Game UI
- [ ] Score display
- [ ] Health bar
- [ ] Ammo counter
- [ ] Power-up indicators
- [ ] Chat and notifications

### Task 4.3: Input Handling
- [ ] Mouse/touch controls
- [ ] Keyboard input
- [ ] Mobile responsiveness
- [ ] Controller support

---

## Phase 5: Admin Panel (Week 5)

### Task 5.1: Admin Authentication
- [ ] Admin login
- [ ] Role-based access control
- [ ] Audit logging

### Task 5.2: Admin Dashboard
- [ ] Revenue statistics
- [ ] Active users monitoring
- [ ] Withdrawal management
- [ ] Promotion management

### Task 5.3: Game Management
- [ ] Room configuration
- [ ] Airplane spawn rates
- [ ] Boss scheduling
- [ ] Event management

---

## Phase 6: Testing & QA (Week 6)

### Task 6.1: Unit Tests
- [ ] Service layer tests
- [ ] Utility function tests
- [ ] Database connection tests

### Task 6.2: Integration Tests
- [ ] API endpoint tests
- [ ] WebSocket communication tests
- [ ] Payment flow tests

### Task 6.3: Performance Testing
- [ ] Load testing
- [ ] Stress testing
- [ ] Concurrent player limits

---

## Technology Stack

### Backend
- **Runtime**: Node.js 20+
- **Language**: TypeScript
- **Framework**: Express.js
- **Real-time**: Socket.io
- **Databases**: MongoDB, PostgreSQL, Redis
- **Authentication**: JWT + bcrypt
- **Testing**: Jest

### Frontend (Client)
- **Framework**: React 18
- **Graphics**: Three.js (WebGL)
- **State Management**: Zustand
- **Router**: React Router
- **Build Tool**: Vite

### Frontend (Admin)
- **Framework**: React 18
- **UI Library**: Ant Design
- **Build Tool**: Vite

### DevOps
- **Container**: Docker
- **Orchestration**: Kubernetes (optional)
- **CI/CD**: GitHub Actions (optional)

---

## Key Requirements Tracking

### Authentication & Security (Req 1-2, 14)
- [x] Project structure supports JWT auth
- [ ] Implement registration/login
- [ ] Implement account lockout
- [ ] Implement audit logging

### Game Management (Req 3-9)
- [ ] Room management system
- [ ] Airplane spawning
- [ ] Boss encounters
- [ ] Jackpot mechanism
- [ ] Drop system

### Financial System (Req 10-12)
- [ ] Transaction management
- [ ] KYC verification
- [ ] Payment integration
- [ ] Balance tracking

### Admin Panel (Req 13)
- [ ] Statistics dashboard
- [ ] Event management
- [ ] Player management
- [ ] Financial reports

### Performance & Scalability (Req 15-18)
- [ ] Database optimization
- [ ] Caching strategy
- [ ] Load balancing ready
- [ ] Monitoring setup

---

## Getting Started

```bash
# Install dependencies
npm install

# Setup environment variables
cp packages/server/.env.example packages/server/.env

# Run development servers
npm run dev

# Run tests
npm test

# Build for production
npm build
```

## Documentation Files
- `requirements.md` - Business requirements
- `design.md` - Technical architecture
- `tasks.md` - Implementation tasks breakdown
