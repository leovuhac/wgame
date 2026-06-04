# 🎮 Airplane Shooter Webgame Online

A multi-platform (Web, iOS, Android) 3D shooting game with real-time multiplayer, jackpot mechanics, and integrated payment system supporting Vietnamese banks and digital wallets.

## 📋 Project Structure

This is a **TypeScript monorepo** with the following packages:

```
packages/
├── shared/           # Core types, interfaces, and utilities
├── server/           # Game server (Express.js + Socket.io)
├── client/           # Web client (React + Three.js)
└── admin/            # Admin panel (React + Ant Design)
```

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- pnpm or npm
- MongoDB (local or Atlas)
- PostgreSQL
- Redis

### Installation

```bash
# Install dependencies
npm install

# Setup environment variables
cp packages/server/.env.example packages/server/.env
# Edit .env with your configuration

# Run development servers
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## 📚 Documentation

- **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Development plan and roadmap
- **[Requirements](./packages/shared/../../.kiro/specs/airplane-shooter-webgame/requirements.md)** - Business requirements
- **[Design](./packages/shared/../../.kiro/specs/airplane-shooter-webgame/design.md)** - Technical architecture
- **[Tasks](./packages/shared/../../.kiro/specs/airplane-shooter-webgame/tasks.md)** - Implementation tasks

## 🎯 Features

### Core Gameplay
- Real-time multiplayer (WebSocket-based)
- Multiple airplane types with unique mechanics
- Boss encounters with jackpot triggers
- Power-up system
- Collision detection and physics

### Payment System
- Integrated with Vietnamese banks (Vietcombank, Techcombank)
- MoMo wallet support
- ZaloPay integration
- Deposit and withdrawal flows
- Transaction tracking and audit logs

### Security
- JWT authentication
- Account lockout protection
- KYC verification
- Audit logging
- Rate limiting

### Admin Panel
- Revenue statistics
- Player management
- Room configuration
- Promotion management
- Event scheduling

## 📱 Platforms

- **Web**: React + Three.js + Socket.io
- **iOS**: React Native + WebView (future)
- **Android**: React Native + WebView (future)

## 🛠️ Technology Stack

### Backend
- **Framework**: Express.js
- **Real-time**: Socket.io
- **Databases**: MongoDB, PostgreSQL, Redis
- **Language**: TypeScript
- **Authentication**: JWT + bcrypt

### Frontend
- **Framework**: React 18
- **Graphics Engine**: Three.js
- **UI Admin**: Ant Design
- **State Management**: Zustand
- **Build Tool**: Vite

## 📊 Current Status

**Phase 1: Foundation & Infrastructure** ✅ COMPLETED
- Project structure setup
- Type definitions
- Development environment

**Phase 2: Data Layer** 🟡 IN PROGRESS
- [ ] MongoDB schemas
- [ ] PostgreSQL migrations
- [ ] Redis setup

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit your changes: `git commit -am 'Add feature'`
3. Push to the branch: `git push origin feature/your-feature`
4. Submit a pull request

## 📄 License

Proprietary - All rights reserved