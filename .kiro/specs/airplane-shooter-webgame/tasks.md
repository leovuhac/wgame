# Implementation Plan: Airplane Shooter Webgame Online

## Overview

Kế hoạch này chia nhỏ toàn bộ hệ thống Airplane Shooter Webgame thành các bước triển khai tuần tự, từ cơ sở hạ tầng dữ liệu đến game client 3D, đảm bảo mỗi bước đều có thể chạy độc lập và tích hợp liền mạch vào hệ thống trước đó. Ngôn ngữ triển khai: **TypeScript** (Node.js cho backend, React/Three.js cho frontend).

## Tasks

- [ ] 1. Thiết lập cấu trúc dự án và các kiểu dữ liệu cốt lõi
  - Tạo monorepo với các package: `server`, `client`, `admin`, `shared`
  - Cấu hình TypeScript strict mode, ESLint, Prettier cho toàn bộ workspace
  - Tạo file `shared/src/types/index.ts` định nghĩa tất cả interface và enum cốt lõi: `Player`, `GameRoom`, `Airplane`, `Boss`, `Transaction`, `Promotion`, `AirplaneType`, `BossType`, `RoomType`, `PlayerStatus`, `TransactionType`, `PromotionType`, `PaymentMethod`
  - Tạo `shared/src/types/events.ts` định nghĩa toàn bộ WebSocket events (client→server và server→client)
  - Tạo `shared/src/types/api.ts` định nghĩa request/response types cho tất cả REST API endpoint
  - Cài đặt và cấu hình Jest với ts-jest cho toàn bộ workspace
  - _Yêu cầu: 1.1, 2.1, 3.1, 4.1, 5.1, 6.1_

- [ ] 2. Xây dựng Data Layer và kết nối database
  - [ ] 2.1 Thiết lập kết nối MongoDB và định nghĩa Mongoose schemas
    - Tạo `server/src/db/mongo/schemas/player.schema.ts` với toàn bộ fields theo mô hình `Player` trong design
    - Tạo `server/src/db/mongo/schemas/room.schema.ts`, `airplane.schema.ts`, `boss.schema.ts`
    - Tạo `server/src/db/mongo/schemas/promotion.schema.ts`
    - Implement `server/src/db/mongo/connection.ts` với retry logic 3 lần và exponential backoff
    - _Yêu cầu: 3.1, 5.1, 11.1, 18.1_

  - [ ] 2.2 Thiết lập kết nối PostgreSQL và định nghĩa schemas tài chính
    - Tạo migration files cho bảng `transactions` (append-only, không có DELETE permission)
    - Tạo migration cho bảng `audit_logs` (append-only)
    - Tạo migration cho bảng `deposit_orders` và `withdraw_orders`
    - Implement `server/src/db/postgres/connection.ts` với connection pool và retry logic
    - _Yêu cầu: 10.3, 15.2, 15.4_

  - [ ] 2.3 Thiết lập Redis Cluster và các utility functions
    - Implement `server/src/db/redis/client.ts` kết nối Redis với retry logic
    - Tạo `server/src/db/redis/session.ts` cho quản lý session người chơi
    - Tạo `server/src/db/redis/leaderboard.ts` với các hàm thao tác Redis Sorted Set
    - Tạo `server/src/db/redis/cache.ts` với generic cache get/set/invalidate
    - _Yêu cầu: 7.2, 7.4, 17.7_

  - [ ]* 2.4 Viết unit tests cho database connection và retry logic
    - Test MongoDB retry 3 lần khi lỗi DB_001
    - Test PostgreSQL connection pool exhaustion
    - Test Redis fallback khi cache miss
    - _Yêu cầu: 18.1_

- [ ] 3. Xây dựng Auth Service và bảo mật JWT
  - [ ] 3.1 Implement đăng ký và đăng nhập tài khoản
    - Tạo `server/src/services/auth/auth.service.ts` với `register()`, `login()`, `logout()`
    - Implement password hashing với bcrypt (salt rounds = 12)
    - Implement JWT generation với thời hạn 24 giờ trong `server/src/services/auth/jwt.service.ts`
    - Implement input validation (username 4–32 ký tự, password ≥ 8 ký tự, email hợp lệ)
    - _Yêu cầu: 1.1, 1.2, 1.3_

  - [ ] 3.2 Implement brute-force protection và account lockout
    - Tạo `server/src/services/auth/lockout.service.ts` theo dõi failed attempts trong Redis
    - Implement logic khóa tài khoản tạm thời 15 phút sau 5 lần sai liên tiếp
    - Emit security event sang Kafka khi tài khoản bị khóa
    - _Yêu cầu: 1.4_

  - [ ]* 3.3 Viết property test cho cơ chế khóa tài khoản (Property 9)
    - **Property 9: Khóa tài khoản sau đăng nhập sai nhiều lần**
    - Dùng fast-check: với mọi tài khoản, sau đúng 5 lần sai, mọi lần thử tiếp theo trong 15 phút đều bị từ chối
    - **Validates: Yêu cầu 1.4**

  - [ ] 3.4 Implement JWT refresh token và token revocation
    - Implement `refreshToken()` chấp nhận token hết hạn không quá 5 phút
    - Lưu danh sách revoked tokens trong Redis với TTL phù hợp
    - Implement middleware `requireAuth` kiểm tra JWT trên mọi protected endpoint
    - _Yêu cầu: 1.5, 1.6_

  - [ ]* 3.5 Viết property test cho JWT validation (Property 8)
    - **Property 8: Xác thực JWT - từ chối token không hợp lệ**
    - Dùng fast-check: với mọi request không có valid JWT (thiếu token, sai chữ ký, hết hạn), response.status = 401 và không có side effects
    - **Validates: Yêu cầu 14.1**

  - [ ] 3.6 Implement audit logging cho tất cả sự kiện auth
    - Tạo `server/src/services/audit/audit.service.ts` ghi log vào PostgreSQL append-only
    - Log mọi sự kiện: đăng nhập thành công/thất bại, đăng xuất, token refresh, bao gồm IP và device info
    - Publish audit events sang Kafka
    - _Yêu cầu: 1.7, 15.4_

- [ ] 4. Checkpoint - Xác thực cơ sở hạ tầng
  - Đảm bảo tất cả unit tests và property tests pass, hỏi người dùng nếu có vướng mắc.

- [ ] 5. Xây dựng Player Profile Service và KYC
  - [ ] 5.1 Implement player profile CRUD
    - Tạo `server/src/services/player/player.service.ts` với `getProfile()`, `updateProfile()`
    - Implement `getBalance()` trả về balance, frozenBalance, totalDeposit, totalWithdraw, totalWin, totalLose
    - Implement device tracking: lưu và cập nhật `DeviceInfo[]` theo platform (WEB/IOS/ANDROID)
    - _Yêu cầu: 2.1, 2.2, 2.5_

  - [ ] 5.2 Implement KYC verification flow
    - Tạo `server/src/services/player/kyc.service.ts` xử lý gửi và cập nhật KYC
    - Implement kiểm tra `kycVerified` trước khi cho phép giao dịch vượt hạn mức
    - _Yêu cầu: 2.3, 2.4_

  - [ ]* 5.3 Viết unit tests cho player profile và KYC
    - Test cập nhật profile phản ánh ngay trên giao diện
    - Test từ chối giao dịch khi chưa KYC
    - _Yêu cầu: 2.2, 2.4_

- [ ] 6. Xây dựng Payment Service - Nạp Tiền
  - [ ] 6.1 Implement tạo lệnh nạp tiền
    - Tạo `server/src/services/payment/deposit.service.ts` với `createDepositOrder()`
    - Implement validation: amount 50.000–500.000.000 VNĐ, kiểm tra daily limit 1 tỷ VNĐ, kiểm tra KYC
    - Tích hợp Vietcombank, Techcombank, MB Bank APIs để tạo QR/URL thanh toán
    - Lưu đơn hàng PENDING vào PostgreSQL, schedule auto-cancel sau 15 phút
    - _Yêu cầu: 8.1, 8.2, 8.3_

  - [ ] 6.2 Implement xử lý payment callback với HMAC validation
    - Tạo `server/src/services/payment/callback.service.ts` với `processCallback()`
    - Implement HMAC-SHA256 signature validation với secret key của từng provider
    - Implement idempotency: kiểm tra orderId đã xử lý chưa trước khi cộng tiền
    - Cập nhật balance và transaction status trong một DB transaction atomic
    - Emit payment event sang Kafka, gửi push notification cho người chơi
    - _Yêu cầu: 8.4, 8.5, 8.6_

  - [ ]* 6.3 Viết property test cho payment callback idempotency (Property 4)
    - **Property 4: Payment callback idempotency**
    - Dùng fast-check: với mọi callback hợp lệ, gọi `processCallback()` nhiều lần với cùng orderId, balanceChange phải bằng nhau (chỉ cộng tiền 1 lần)
    - **Validates: Yêu cầu 8.5**

  - [ ] 6.4 Implement MoMo và ZaloPay integration
    - Tạo `server/src/services/payment/providers/momo.provider.ts`
    - Tạo `server/src/services/payment/providers/zalopay.provider.ts`
    - Implement payment provider interface chung `IPaymentProvider` để dễ mở rộng
    - _Yêu cầu: 8.2_

  - [ ]* 6.5 Viết unit tests cho payment providers
    - Test với mock bank API responses (success, failed, timeout)
    - Test auto-cancel sau 15 phút
    - Test daily limit enforcement
    - _Yêu cầu: 8.3, 8.7_

- [ ] 7. Xây dựng Payment Service - Rút Tiền và Lịch Sử
  - [ ] 7.1 Implement tạo lệnh rút tiền
    - Tạo `server/src/services/payment/withdraw.service.ts` với `createWithdrawOrder()`
    - Implement kiểm tra balance khả dụng (balance - frozenBalance) trước khi cho phép rút
    - Implement tạm khóa frozenBalance khi tạo lệnh rút
    - Mã hóa thông tin ngân hàng người nhận bằng AES-256-GCM trước khi lưu
    - _Yêu cầu: 9.1, 9.2, 9.5_

  - [ ] 7.2 Implement xử lý kết quả rút tiền và rollback
    - Implement `processWithdrawResult()`: giải phóng frozenBalance và trừ balance khi thành công
    - Implement rollback: hoàn trả frozenBalance về balance khi thất bại hoặc timeout (PAY_001)
    - _Yêu cầu: 9.3, 9.4, 15.5, 18.4_

  - [ ]* 7.3 Viết property test cho số dư người chơi không âm (Property 6)
    - **Property 6: Số dư người chơi không bao giờ âm**
    - Dùng fast-check: với mọi chuỗi sự kiện rút tiền và bắn đạn, (balance - frozenBalance) phải luôn ≥ 0
    - **Validates: Yêu cầu 4.3, 9.2**

  - [ ] 7.4 Implement transaction history API
    - Tạo `server/src/services/payment/history.service.ts` với `getTransactionHistory()`
    - Implement filtering theo khoảng thời gian, loại giao dịch (DEPOSIT/WITHDRAW/WIN/LOSE/BONUS/REFUND), trạng thái
    - Implement phân trang (pagination) với cursor-based hoặc offset
    - _Yêu cầu: 10.1, 10.2, 10.3_

  - [ ]* 7.5 Viết unit tests cho rút tiền và lịch sử giao dịch
    - Test frozen balance không cho phép rút quá số dư
    - Test rollback đúng khi payment timeout
    - Test filter lịch sử giao dịch
    - _Yêu cầu: 9.2, 9.4, 10.2_

- [ ] 8. Checkpoint - Xác thực Payment Service
  - Đảm bảo tất cả payment tests pass, kiểm tra idempotency và balance integrity, hỏi người dùng nếu có vướng mắc.

- [ ] 9. Xây dựng Encryption Service và Security Layer
  - [ ] 9.1 Implement AES-256-GCM encryption service
    - Tạo `server/src/services/security/encryption.service.ts`
    - Implement `encrypt(data, userId)` với IV riêng mỗi lần, key được derive từ MASTER_KEY và userId
    - Implement `decrypt(encryptedData, userId)` khôi phục dữ liệu gốc
    - Sử dụng Node.js built-in `crypto` module với AES-256-GCM
    - _Yêu cầu: 14.3_

  - [ ]* 9.2 Viết property test cho AES-256-GCM round trip (Property 7)
    - **Property 7: Mã hóa dữ liệu nhạy cảm - round trip**
    - Dùng fast-check: với mọi plaintext hợp lệ, `decrypt(encrypt(plaintext, key), key) = plaintext`
    - **Validates: Yêu cầu 14.3**

  - [ ] 9.3 Implement Rate Limiting middleware
    - Tạo `server/src/middleware/rateLimiter.ts` dùng Redis sliding window algorithm
    - Cấu hình rate limit khác nhau cho từng endpoint (API, WebSocket, payment)
    - Trả về HTTP 429 khi vượt giới hạn, implement exponential backoff hint trong response headers
    - _Yêu cầu: 14.5, 18.3_

  - [ ] 9.4 Implement Input Validation và Sanitization middleware
    - Tạo `server/src/middleware/validation.ts` dùng Joi schemas
    - Implement sanitization chống SQL Injection, XSS cho tất cả user input
    - Tích hợp vào tất cả REST API routes
    - _Yêu cầu: 14.6_

  - [ ] 9.5 Implement RBAC (Role-Based Access Control)
    - Tạo `server/src/middleware/rbac.ts` phân quyền theo role (PLAYER, ADMIN)
    - Bảo vệ tất cả endpoint `/api/v1/admin/*` chỉ cho phép role ADMIN
    - Implement `requireAdmin` middleware
    - _Yêu cầu: 14.2_

  - [ ]* 9.6 Viết unit tests cho security middleware
    - Test rate limiter trả về 429 đúng ngưỡng
    - Test RBAC từ chối PLAYER truy cập admin endpoints
    - Test input sanitization với SQL injection payloads
    - _Yêu cầu: 14.5, 14.2, 14.6_

- [ ] 10. Xây dựng Game Engine - Core Logic
  - [ ] 10.1 Implement Collision Detection Module
    - Tạo `server/src/game/collision/collision.service.ts`
    - Implement AABB broad phase: `intersectsAABB(bulletBox, targetBox)`
    - Implement ray-sphere narrow phase: `rayIntersectsSphere(ray, sphere)` theo thuật toán trong design
    - Implement `detectCollisions(bullet, targets)` với BVH tree traversal và sorting theo khoảng cách
    - _Yêu cầu: 4.2_

  - [ ]* 10.2 Viết property test cho collision detection determinism (Property 2)
    - **Property 2: Collision detection deterministic**
    - Dùng fast-check: với mọi cặp (bullet, target), `detectCollision(b,t)` được gọi 2 lần với cùng input phải cho kết quả giống nhau
    - **Validates: Yêu cầu 4.2**

  - [ ] 10.3 Implement Airplane Spawning System
    - Tạo `server/src/game/spawn/airplane.spawner.ts`
    - Implement `weightedRandomSelect(table)` cho spawn theo tỷ lệ
    - Implement `spawnAirplanes(room, deltaTime)` theo thuật toán design: tính số lượng spawn dựa trên số người chơi, kiểm tra maxAirplanes
    - Implement spawn position generation ngoài màn hình
    - _Yêu cầu: 5.1, 5.5_

  - [ ] 10.4 Implement Boss Spawning và Phase Management
    - Tạo `server/src/game/spawn/boss.spawner.ts`
    - Implement `shouldSpawnBoss(room)` với triggerCondition per boss type
    - Implement boss phase transitions khi health xuống ngưỡng xác định
    - Broadcast `BOSS_SPAWN` và `BOSS_PHASE` events tới toàn phòng
    - _Yêu cầu: 5.2, 5.3, 5.4_

  - [ ] 10.5 Implement Game Room Manager
    - Tạo `server/src/game/room/room.manager.ts` với `createRoom()`, `joinRoom()`, `leaveRoom()`
    - Implement validation: số dư đủ, phòng chưa đầy, tài khoản ACTIVE khi vào phòng
    - Implement auto-leave sau 30 giây ngắt kết nối theo `handlePlayerDisconnect()` trong design
    - Lưu room state trong Redis, persist vào MongoDB
    - _Yêu cầu: 3.2, 3.3, 3.5, 3.6_

  - [ ]* 10.6 Viết unit tests cho game room và spawning
    - Test từ chối vào phòng khi số dư không đủ
    - Test auto-leave sau 30 giây
    - Test spawn airplane không vượt maxAirplanes
    - Test boss phase transition
    - _Yêu cầu: 3.2, 3.3, 3.5, 5.4, 5.5_

- [ ] 11. Xây dựng Game Engine - Shot Processing và Balance
  - [ ] 11.1 Implement Shot Processing với atomic balance update
    - Tạo `server/src/game/shot/shot.processor.ts` với `processShootEvent(event, context)`
    - Implement rate limiting: từ chối shot vượt 10 shots/giây
    - Implement timestamp validation: từ chối nếu lệch hơn 500ms
    - Implement atomic transaction: trừ chi phí đạn + tính thưởng + cập nhật target health trong 1 operation
    - Đảm bảo mỗi mục tiêu chỉ được tính thưởng đúng 1 lần dù nhiều người bắn cùng lúc (sử dụng Redis lock)
    - _Yêu cầu: 4.1, 4.3, 4.4, 4.5, 4.6, 4.7_

  - [ ]* 11.2 Viết property test cho tổng số dư hệ thống không đổi (Property 1)
    - **Property 1: Bảo toàn tổng số dư hệ thống**
    - Dùng fast-check: với mọi tập initialBalances (≥ 0) và chuỗi gameEvents, `sum(balancesBefore) = sum(balancesAfter)` sau khi xử lý
    - **Validates: Yêu cầu 15.1**

  - [ ] 11.3 Implement Server Game Loop
    - Tạo `server/src/game/loop/game.loop.ts` theo `runGameLoop()` trong design
    - Implement 30 FPS tick loop với deltaTime calculation
    - Implement `buildStateSnapshot()` và broadcast delta state (MessagePack encoded)
    - Implement `checkPromotionExpiry(room)` trong mỗi tick
    - _Yêu cầu: 3.4, 13.3, 17.1, 17.2_

  - [ ] 11.4 Broadcast shot results và game state
    - Implement `broadcastShotResult()` gửi `SHOT_RESULT` event với hitResults và reward tới toàn phòng
    - Implement delta compression: chỉ gửi thay đổi so với tick trước, giảm ≥ 70% băng thông
    - _Yêu cầu: 4.8, 13.3_

  - [ ]* 11.5 Viết integration tests cho shot processing
    - Test xử lý shot end-to-end: bắn → trúng → nhận thưởng → balance cập nhật
    - Test concurrent shots: nhiều người bắn cùng 1 target, chỉ 1 người nhận thưởng kill
    - Test rate limit enforcement
    - _Yêu cầu: 4.1, 4.7, 4.4_

- [ ] 12. Xây dựng Jackpot Module
  - [ ] 12.1 Implement Jackpot Trigger và Distribution
    - Tạo `server/src/game/jackpot/jackpot.module.ts`
    - Implement `checkJackpotTrigger(killEvent, room)` theo thuật toán design: tính finalProbability từ baseProbability * poolMultiplier * promotionMultiplier, giới hạn tối đa 100%
    - Implement `distributeJackpotReward()` với Redis distributed lock để tránh race condition
    - Implement reset jackpotPool về minJackpotPool sau khi phân phối
    - Broadcast `JACKPOT_EVENT` với thông tin winners và amount
    - _Yêu cầu: 6.1, 6.3, 6.4, 6.5_

  - [ ]* 12.2 Viết property test cho jackpot pool không âm (Property 3)
    - **Property 3: Jackpot pool không bao giờ âm**
    - Dùng fast-check: với mọi chuỗi KillEvents và initialPool ≥ minJackpotPool, sau khi xử lý `room.jackpotPool >= minJackpotPool`
    - **Validates: Yêu cầu 6.2**

  - [ ]* 12.3 Viết property test cho jackpot phân phối đúng người thắng (Property 5)
    - **Property 5: Jackpot phân phối đúng người thắng**
    - Dùng fast-check: với mọi killEvent boss và room, nếu jackpot triggered thì `winners ⊆ room.currentPlayers` và `sum(sharePercentage) = 1.0`
    - **Validates: Yêu cầu 6.3**

  - [ ] 12.4 Implement jackpot pool contribution khi không trigger
    - Implement `calculatePoolContribution(killEvent)` cộng vào jackpotPool khi boss chết mà không trigger jackpot
    - Implement JACKPOT_BOOST promotion multiplier
    - _Yêu cầu: 6.6, 6.7_

  - [ ]* 12.5 Viết integration tests cho jackpot concurrency
    - Test nhiều boss chết cùng lúc, chỉ 1 jackpot được kích hoạt (Redis lock)
    - Test JACKPOT_BOSS luôn trigger jackpot
    - Test pool contribution tích lũy đúng
    - _Yêu cầu: 6.1, 6.4, 6.6_

- [ ] 13. Checkpoint - Xác thực Game Engine
  - Đảm bảo tất cả game engine tests pass bao gồm property tests cho collision, jackpot và balance, hỏi người dùng nếu có vướng mắc.

- [ ] 14. Xây dựng Leaderboard Service
  - [ ] 14.1 Implement Leaderboard update với Redis Sorted Set
    - Tạo `server/src/services/leaderboard/leaderboard.service.ts`
    - Implement `updateLeaderboard(event)` cập nhật điểm atomic trong Redis ZSET theo 4 khung thời gian: DAILY, WEEKLY, MONTHLY, ALL_TIME
    - Trả về `{ newRank, previousRank, newScore, rankChanged }` sau mỗi update
    - Implement broadcast `LEADERBOARD_UPDATE` khi người chơi lên TOP 10
    - _Yêu cầu: 7.1, 7.2, 7.3_

  - [ ] 14.2 Implement Leaderboard query với Redis cache fallback
    - Implement `getLeaderboard(filter)` lấy từ Redis trước, fallback sang MongoDB khi cache miss
    - Giới hạn tối đa 100 entries mỗi lần query
    - Luôn include thứ hạng của người chơi đang xem kể cả khi không nằm trong top
    - _Yêu cầu: 7.4, 7.5_

  - [ ]* 14.3 Viết unit tests cho leaderboard
    - Test atomic rank update không bị race condition
    - Test cache fallback khi Redis miss
    - Test hiển thị thứ hạng người chơi ngoài top 100
    - _Yêu cầu: 7.2, 7.4, 7.5_

- [ ] 15. Xây dựng Promotions Service
  - [ ] 15.1 Implement Promotion CRUD và lifecycle
    - Tạo `server/src/services/promotions/promotion.service.ts`
    - Implement tạo, cập nhật, tạm dừng (PAUSE) và kết thúc sớm (EXPIRE) promotion
    - Implement `checkPromotionExpiry()` tự động chuyển status sang EXPIRED khi hết thời gian
    - Publish promotion events sang Kafka để game servers nhận cập nhật
    - _Yêu cầu: 11.4, 11.5_

  - [ ] 15.2 Implement Promotion reward application
    - Implement `applyPromotion(promo, playerId)` kiểm tra conditions, tính reward
    - Implement kiểm tra maxParticipants trước khi cộng reward
    - Hỗ trợ 5 loại: DEPOSIT_BONUS, CASHBACK, FREE_BULLETS, DOUBLE_XP, SPECIAL_BOSS
    - _Yêu cầu: 11.2, 11.3, 11.5, 5.6_

  - [ ]* 15.3 Viết unit tests cho promotions
    - Test từ chối khi maxParticipants đạt giới hạn
    - Test auto-expire promotion đúng thời gian
    - Test SPECIAL_BOSS tăng tỷ lệ boss spawn
    - _Yêu cầu: 11.3, 11.4, 5.6_

- [ ] 16. Xây dựng i18n Service
  - [ ] 16.1 Implement translation engine với caching
    - Tạo `server/src/services/i18n/i18n.service.ts` với `resolveTranslation(key, lang, params)` theo pseudocode trong design
    - Implement fallback chain: lang → VI → key gốc
    - Cache kết quả dịch thuật trong Redis với TTL 1 giờ
    - Tạo translation files cho VI, EN, TH trong `shared/src/i18n/`
    - _Yêu cầu: 12.1, 12.3, 12.4_

  - [ ] 16.2 Implement dynamic parameter interpolation
    - Implement `interpolate(template, params)` hỗ trợ cú pháp `{paramName}` trong chuỗi dịch
    - Test với ví dụ: `"Chúc mừng {playerName} trúng jackpot {amount} VNĐ"`
    - _Yêu cầu: 12.5_

  - [ ]* 16.3 Viết unit tests cho i18n
    - Test fallback sang VI khi key không có trong ngôn ngữ được chọn
    - Test fallback sang key gốc khi cả VI cũng không có
    - Test parameter interpolation với các giá trị dynamic
    - _Yêu cầu: 12.3, 12.5_

- [ ] 17. Xây dựng WebSocket Server
  - [ ] 17.1 Implement WebSocket server với Socket.IO
    - Tạo `server/src/websocket/ws.server.ts` dùng Socket.IO
    - Implement JWT authentication cho WebSocket handshake
    - Implement timestamp validation (reject nếu lệch > 500ms) cho mọi game events
    - Implement Redis pub/sub để broadcast state qua multiple server instances
    - _Yêu cầu: 3.4, 14.10, 17.6_

  - [ ] 17.2 Implement WebSocket event handlers
    - Implement handlers cho tất cả ClientEvents: `JOIN_ROOM`, `LEAVE_ROOM`, `SHOOT`, `PING`
    - Implement `handlePlayerDisconnect()` theo pseudocode design: đánh dấu DISCONNECTED, lưu state, schedule auto-leave 30s
    - Implement reconnection handler: khôi phục game state khi player kết nối lại trong 30s
    - _Yêu cầu: 3.5, 3.6, 18.2_

  - [ ] 17.3 Implement TLS 1.3 và WAF configuration
    - Cấu hình HTTPS/WSS với TLS 1.3 trong `server/src/config/tls.config.ts`
    - Tạo Nginx config file với WAF rules, rate limiting headers và proxy_pass
    - _Yêu cầu: 14.8, 14.9_

  - [ ]* 17.4 Viết integration tests cho WebSocket
    - Test 50 client đồng thời trong 1 phòng, kiểm tra consistency của game state
    - Test reconnection trong vòng 30s khôi phục đúng session
    - Test timestamp validation từ chối event lệch > 500ms
    - _Yêu cầu: 3.4, 3.5, 14.10_

- [ ] 18. Xây dựng Admin Panel Backend
  - [ ] 18.1 Implement Revenue Reporting Service
    - Tạo `server/src/services/admin/revenue.service.ts` với `generateRevenueReport(filter)` theo pseudocode design
    - Implement parallel queries: deposits, withdrawals, game events, jackpot events
    - Implement caching kết quả với Redis TTL 5 phút
    - Hỗ trợ filter: khoảng ngày tối đa 365 ngày, loại phòng, phương thức thanh toán
    - _Yêu cầu: 16.2, 17.7_

  - [ ] 18.2 Implement Report Export (XLSX, CSV, PDF)
    - Tạo `server/src/services/admin/export.service.ts`
    - Implement export sang XLSX dùng `exceljs`, CSV thuần, PDF dùng `pdfkit`
    - _Yêu cầu: 16.3_

  - [ ] 18.3 Implement Player Management API (ban/unban)
    - Implement `banPlayer(playerId, reason)`: chuyển status BANNED, revoke JWT ngay lập tức, ghi audit log
    - Implement `getPlayerStats(playerId)` trả về thống kê đầy đủ
    - _Yêu cầu: 16.4_

  - [ ] 18.4 Implement System Health endpoint
    - Tạo `server/src/services/admin/health.service.ts` kiểm tra tất cả thành phần: MongoDB, PostgreSQL, Redis, Kafka, Payment Gateway
    - Trả về trạng thái và latency của từng thành phần
    - _Yêu cầu: 16.6_

  - [ ] 18.5 Implement Kafka consumer cho real-time dashboard
    - Tạo `server/src/services/admin/kafka.consumer.ts` subscribe transaction events từ Kafka
    - Stream revenue updates sang Admin Panel qua Socket.IO
    - _Yêu cầu: 16.1, 16.7_

  - [ ]* 18.6 Viết unit tests cho admin services
    - Test revenue report caching (TTL 5 phút)
    - Test ban player revoke JWT ngay lập tức
    - Test health check trả về đúng status từng thành phần
    - _Yêu cầu: 16.1, 16.4, 16.6_

- [ ] 19. Checkpoint - Xác thực Backend hoàn chỉnh
  - Đảm bảo tất cả backend services đã được test, Kafka consumer hoạt động, hỏi người dùng nếu có vướng mắc.

- [ ] 20. Xây dựng Game Client - Three.js 3D Engine
  - [ ] 20.1 Thiết lập Three.js scene và renderer
    - Tạo `client/src/game/renderer/game.renderer.ts` khởi tạo Three.js WebGLRenderer
    - Implement `initialize(config)` với antialiasing, shadow maps, post-processing effects
    - Implement `renderFrame(deltaTime)` game loop trên client
    - Implement asset preloading: critical assets (background, player_ship, bullets) trước, non-critical sau
    - _Yêu cầu: 13.1, 13.2_

  - [ ] 20.2 Implement 3D models cho máy bay và boss
    - Tạo `client/src/game/models/airplane.model.ts` cho 4 loại FIGHTER, BOMBER, SCOUT, STEALTH
    - Tạo `client/src/game/models/boss.model.ts` cho 3 loại boss với multi-phase animations
    - Implement movement patterns cho mỗi loại máy bay
    - _Yêu cầu: 5.1, 5.2_

  - [ ] 20.3 Implement Input Handler đa nền tảng
    - Tạo `client/src/game/input/input.handler.ts`
    - Implement mouse events (Web), touch events (iOS/Android), keyboard events (Web)
    - Map input events sang game actions (shoot, aim)
    - _Yêu cầu: 13.4_

  - [ ]* 20.4 Viết unit tests cho renderer và input handler
    - Test preload critical assets trước khi show game UI
    - Test input mapping đúng cho cả 3 loại input
    - _Yêu cầu: 13.2, 13.4_

- [ ] 21. Xây dựng Game Client - WebSocket và State Management
  - [ ] 21.1 Implement WebSocket client với Socket.IO
    - Tạo `client/src/network/ws.client.ts` kết nối tới game server
    - Implement auto-reconnect logic
    - Implement MessagePack encoding/decoding cho game state messages
    - Implement delta state merging: apply delta updates lên current state
    - _Yêu cầu: 13.3, 18.2_

  - [ ] 21.2 Implement Zustand state stores
    - Tạo `client/src/store/game.store.ts` quản lý game state (airplanes, bullets, players)
    - Tạo `client/src/store/player.store.ts` quản lý profile, balance, rank
    - Tạo `client/src/store/ui.store.ts` quản lý UI state (language, notifications)
    - _Yêu cầu: 13.5_

  - [ ] 21.3 Implement real-time UI components
    - Tạo `client/src/components/HUD/ScoreHUD.tsx` hiển thị điểm số, số dư real-time
    - Tạo `client/src/components/HUD/LeaderboardHUD.tsx` hiển thị bảng xếp hạng trong phòng
    - Tạo `client/src/components/HUD/EventBanner.tsx` hiển thị thông báo jackpot, sự kiện
    - _Yêu cầu: 13.5_

  - [ ]* 21.4 Viết unit tests cho state management
    - Test delta state merge giữ consistency
    - Test balance update phản ánh ngay trên HUD
    - _Yêu cầu: 13.3, 13.5_

- [ ] 22. Xây dựng Game Client - i18n và Language Switching
  - [ ] 22.1 Integrate i18next cho client-side i18n
    - Cấu hình `client/src/i18n/i18n.config.ts` với 3 ngôn ngữ VI/EN/TH
    - Import translation files từ `shared/src/i18n/`
    - Implement `switchLanguage(lang)` thay đổi ngôn ngữ không cần reload trang
    - _Yêu cầu: 12.1, 12.2_

  - [ ]* 22.2 Viết unit tests cho client i18n
    - Test switch ngôn ngữ không reload trang
    - Test parameter interpolation trong jackpot messages
    - _Yêu cầu: 12.2, 12.5_

- [ ] 23. Xây dựng Admin Panel Frontend
  - [ ] 23.1 Thiết lập React + Ant Design admin app
    - Tạo `admin/src/App.tsx` với React Router và Ant Design layout
    - Implement authentication flow cho admin login
    - Tạo route guards chỉ cho phép role ADMIN
    - _Yêu cầu: 14.2, 16.1_

  - [ ] 23.2 Implement Revenue Dashboard với real-time streaming
    - Tạo `admin/src/pages/Dashboard/RevenueDashboard.tsx`
    - Integrate Socket.IO để nhận real-time revenue updates từ Kafka stream
    - Hiển thị: doanh thu hiện tại, online players, giao dịch trong ngày, system status
    - _Yêu cầu: 16.1, 16.7_

  - [ ] 23.3 Implement Revenue Report với filters và export
    - Tạo `admin/src/pages/Reports/RevenueReport.tsx`
    - Implement date range picker (tối đa 365 ngày), filter theo loại phòng và phương thức thanh toán
    - Implement export buttons: XLSX, CSV, PDF
    - _Yêu cầu: 16.2, 16.3_

  - [ ] 23.4 Implement Player Management UI
    - Tạo `admin/src/pages/Players/PlayerList.tsx` với search, filter, pagination
    - Implement ban/unban player với confirmation dialog và lý do
    - Hiển thị thống kê chi tiết per player
    - _Yêu cầu: 16.4_

  - [ ] 23.5 Implement Promotion Management UI
    - Tạo `admin/src/pages/Promotions/PromotionManager.tsx`
    - Implement CRUD form cho tất cả loại promotion
    - Implement pause/expire buttons với real-time effect trên game rooms
    - _Yêu cầu: 16.5_

  - [ ]* 23.6 Viết unit tests cho admin UI components
    - Test dashboard cập nhật tự động khi nhận Kafka stream event
    - Test ban player hiển thị confirmation và gọi API đúng
    - _Yêu cầu: 16.1, 16.4_

- [ ] 24. Xây dựng Auto-Reconciliation và Financial Integrity
  - [ ] 24.1 Implement daily auto-reconciliation
    - Tạo `server/src/services/payment/reconcile.service.ts` với `autoReconcile(date)`
    - Query giao dịch từ PostgreSQL và so sánh với dữ liệu từ bank/MoMo/ZaloPay APIs
    - Tạo reconciliation report với danh sách chênh lệch nếu có
    - Schedule chạy tự động hàng ngày dùng Node.js cron
    - _Yêu cầu: 15.3_

  - [ ]* 24.2 Viết unit tests cho reconciliation
    - Test phát hiện chênh lệch giữa internal và bank data
    - Test generate report với discrepancy list
    - _Yêu cầu: 15.3_

- [ ] 25. Kết nối và tích hợp toàn hệ thống
  - [ ] 25.1 Wire REST API routes vào Express app
    - Tạo `server/src/api/routes/index.ts` đăng ký tất cả route groups
    - Apply middleware theo thứ tự: WAF headers → Rate Limit → JWT Auth → RBAC → Validation → Handler
    - Cấu hình CORS, compression, request logging
    - _Yêu cầu: 14.1, 14.5_

  - [ ] 25.2 Wire WebSocket events vào game loop
    - Kết nối `ws.server.ts` với `room.manager.ts`, `shot.processor.ts`, `jackpot.module.ts`
    - Đảm bảo tất cả game events được route đúng vào handler tương ứng
    - Integrate Kafka producer: emit events cho payment, jackpot, audit
    - _Yêu cầu: 3.4, 4.8, 6.5_

  - [ ] 25.3 Wire Payment callbacks và notification flow
    - Đăng ký `POST /api/v1/payment/callback/:provider` handlers
    - Kết nối payment success → balance update → WebSocket BALANCE_UPDATE → Kafka event
    - _Yêu cầu: 8.4, 8.6_

  - [ ] 25.4 Wire Game Client với backend
    - Kết nối Three.js renderer với Zustand store (subscribe state changes → update 3D scene)
    - Kết nối user input → WebSocket SHOOT event → nhận SHOT_RESULT → render effects
    - Kết nối language switch → i18next → re-render tất cả UI components
    - _Yêu cầu: 12.2, 13.1, 13.3_

  - [ ]* 25.5 Viết end-to-end integration tests
    - Test full payment flow: Nạp → Chơi → Thắng → Rút (với mock bank API)
    - Test jackpot end-to-end: boss spawn → boss kill → jackpot trigger → balance update → broadcast
    - Test 50 concurrent players trong 1 phòng kiểm tra game state consistency
    - _Yêu cầu: 6.3, 8.4, 15.1_

- [ ] 26. Final Checkpoint - Đảm bảo toàn hệ thống
  - Chạy toàn bộ test suite (unit + property + integration), kiểm tra tất cả property tests pass, hỏi người dùng trước khi hoàn tất.

## Notes

- Tasks đánh dấu `*` là optional và có thể bỏ qua cho MVP nhanh hơn
- Property tests dùng thư viện **fast-check** (TypeScript) như đã chỉ định trong design
- Mỗi task tham chiếu yêu cầu cụ thể để đảm bảo traceability đầy đủ
- Checkpoints tại task 4, 8, 13, 19, 26 đảm bảo xác thực từng giai đoạn
- Tất cả dữ liệu tài chính phải đi qua PostgreSQL append-only tables
- Redis là nguồn dữ liệu chính cho game state, MongoDB cho persistent game data
- Kafka là event bus trung tâm nối game server với admin panel

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["2.1", "2.2", "2.3"] },
    { "id": 1, "tasks": ["2.4", "3.1", "3.2"] },
    { "id": 2, "tasks": ["3.3", "3.4", "5.1"] },
    { "id": 3, "tasks": ["3.5", "3.6", "5.2", "6.1"] },
    { "id": 4, "tasks": ["5.3", "6.2", "9.1"] },
    { "id": 5, "tasks": ["6.3", "6.4", "7.1", "9.2", "9.3"] },
    { "id": 6, "tasks": ["6.5", "7.2", "9.4", "9.5", "10.1"] },
    { "id": 7, "tasks": ["7.3", "7.4", "9.6", "10.2", "10.3"] },
    { "id": 8, "tasks": ["7.5", "10.4", "10.5", "14.1"] },
    { "id": 9, "tasks": ["10.6", "11.1", "14.2", "15.1"] },
    { "id": 10, "tasks": ["11.2", "11.3", "14.3", "15.2", "16.1"] },
    { "id": 11, "tasks": ["11.4", "12.1", "15.3", "16.2"] },
    { "id": 12, "tasks": ["11.5", "12.2", "12.3", "12.4", "16.3"] },
    { "id": 13, "tasks": ["12.5", "17.1", "18.1"] },
    { "id": 14, "tasks": ["17.2", "17.3", "18.2", "18.3", "18.4", "18.5"] },
    { "id": 15, "tasks": ["17.4", "18.6", "20.1", "24.1"] },
    { "id": 16, "tasks": ["20.2", "20.3", "21.1", "24.2"] },
    { "id": 17, "tasks": ["20.4", "21.2", "22.1"] },
    { "id": 18, "tasks": ["21.3", "21.4", "22.2", "23.1"] },
    { "id": 19, "tasks": ["23.2", "23.3", "23.4", "23.5"] },
    { "id": 20, "tasks": ["23.6", "25.1", "25.2"] },
    { "id": 21, "tasks": ["25.3", "25.4"] },
    { "id": 22, "tasks": ["25.5"] }
  ]
}
```
