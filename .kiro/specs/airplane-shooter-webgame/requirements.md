# Requirements Document

## Introduction

Airplane Shooter Webgame Online là một trò chơi bắn máy bay trực tuyến đa nền tảng (Web, iOS, Android) nhắm đến người chơi Việt Nam. Hệ thống tích hợp đồ họa 3D sử dụng Three.js/WebGL, chơi nhiều người thời gian thực qua WebSocket, cơ chế nổ hũ (jackpot) với boss đặc biệt, và hệ thống thanh toán tự động qua ngân hàng Việt Nam và ví điện tử.

Tài liệu này mô tả các yêu cầu nghiệp vụ được dẫn xuất từ tài liệu thiết kế kỹ thuật, bao gồm: quản lý tài khoản người chơi, logic game cốt lõi, hệ thống thanh toán, cơ chế khuyến mãi, quản trị hệ thống và bảo mật.

---

## Glossary

- **Auth_Service**: Dịch vụ xác thực và phân quyền, quản lý JWT + OAuth2
- **Game_Client**: Giao diện người chơi đa nền tảng (Web/iOS/Android) với đồ họa Three.js/WebGL
- **Game_Engine**: Máy chủ xử lý logic game cốt lõi phía server
- **Jackpot_Module**: Module xử lý cơ chế nổ hũ và phân phối phần thưởng
- **Payment_Service**: Dịch vụ nạp/rút tiền tự động qua ngân hàng và ví điện tử
- **Admin_Service**: Dịch vụ quản trị hệ thống, báo cáo doanh thu, quản lý người chơi
- **i18n_Service**: Dịch vụ đa ngôn ngữ hỗ trợ Tiếng Việt, Anh, Thái
- **Security_Layer**: Lớp bảo mật bao gồm WAF, JWT, AES-256, rate limiting
- **WebSocket_Server**: Máy chủ kết nối thời gian thực cho đồng bộ trạng thái game
- **Người_Chơi**: Người dùng cuối tham gia chơi game
- **Admin**: Người quản trị hệ thống có toàn quyền truy cập
- **KYC**: Xác minh danh tính khách hàng (Know Your Customer)
- **Jackpot/Nổ_Hũ**: Cơ chế thưởng lớn khi tiêu diệt boss đặc biệt
- **FIGHTER**: Loại máy bay chiến đấu tốc độ cao, máu thấp
- **BOMBER**: Loại máy bay ném bom, di chuyển chậm, máu nhiều
- **SCOUT**: Loại máy bay trinh sát, kích thước nhỏ, khó bắn
- **STEALTH**: Loại máy bay tàng hình, xuất hiện ngẫu nhiên
- **CARRIER**: Loại máy bay mẹ mang theo máy bay nhỏ hơn, phải tiêu diệt máy bay con trước
- **ARMORED**: Loại máy bay có giáp dày, kháng sát thương cao, chỉ đạn xuyên giáp mới có hiệu quả cao
- **SPEEDER**: Loại máy bay siêu tốc, xuất hiện và biến mất chớp nhoáng trên màn hình
- **SHIELD_PLANE**: Loại máy bay có khiên bảo vệ, phải phá khiên trước mới gây sát thương thực
- **HEALING_PLANE**: Loại máy bay hồi máu cho các máy bay khác trong vùng lân cận
- **DECOY_PLANE**: Loại máy bay tạo phân thân giả để đánh lạc hướng người chơi
- **DRAGON**: Loại máy bay đặc biệt hình rồng bay với cơ chế và phần thưởng độc đáo
- **LUCKY_WHEEL_PLANE**: Loại máy bay đặc biệt khi bị tiêu diệt kích hoạt vòng quay may mắn cho toàn phòng
- **Drop_System**: Hệ thống thả quà ngẫu nhiên khi máy bay bị tiêu diệt
- **Power_Up_System**: Hệ thống vũ khí đặc biệt và kỹ năng tăng cường tạm thời
- **Bullet_Type**: Loại đạn mà người chơi lựa chọn trước khi bắn
- **Skill_System**: Hệ thống kỹ năng cá nhân của người chơi với cooldown và energy tích lũy
- **Lucky_Wheel**: Vòng quay may mắn được kích hoạt bởi LUCKY_WHEEL_PLANE
- **DOT**: Damage Over Time – sát thương gây ra theo thời gian (đạn lửa)
- **Screen_Bomb**: Vũ khí đặc biệt tiêu diệt tất cả máy bay trên màn hình
- **Homing_Missile**: Tên lửa dẫn đường tự động nhắm mục tiêu có giá trị cao nhất
- **Lightning_Chain**: Vũ khí sét lan sang nhiều mục tiêu liên kết
- **Electric_Net**: Vũ khí lưới điện làm chậm tất cả máy bay trong vùng
- **Piercing_Laser**: Laser xuyên suốt màn hình theo đường thẳng
- **MEGA_BOSS**: Boss cấp cao nhất, nhiều giai đoạn chiến đấu
- **MINI_BOSS**: Boss cấp trung, kích hoạt jackpot xác suất thấp
- **JACKPOT_BOSS**: Boss đặc biệt, luôn kích hoạt nổ hũ khi bị tiêu diệt
- **NORMAL_ROOM**: Phòng chơi thông thường, mức cược thấp
- **VIP_ROOM**: Phòng VIP, mức cược cao, phần thưởng lớn
- **TOURNAMENT_ROOM**: Phòng giải đấu, có xếp hạng và giải thưởng tổng kết
- **frozenBalance**: Số dư đang bị tạm giữ trong giao dịch đang xử lý
- **VNĐ**: Đơn vị tiền tệ Việt Nam Đồng

---

## Requirements

### Yêu Cầu 1: Đăng Ký và Xác Thực Tài Khoản

**User Story:** Là một Người_Chơi, tôi muốn đăng ký và đăng nhập tài khoản an toàn, để có thể truy cập game và bảo vệ thông tin cá nhân của mình.

#### Tiêu Chí Chấp Nhận

1. WHEN Người_Chơi gửi yêu cầu đăng ký với username (4–32 ký tự), email hợp lệ và mật khẩu (≥ 8 ký tự), THE Auth_Service SHALL tạo tài khoản mới với trạng thái ACTIVE và trả về xác nhận thành công.
2. IF Người_Chơi gửi yêu cầu đăng ký với username hoặc email đã tồn tại, THEN THE Auth_Service SHALL từ chối yêu cầu và trả về thông báo lỗi xác định rõ trường bị trùng.
3. WHEN Người_Chơi đăng nhập thành công với thông tin hợp lệ, THE Auth_Service SHALL cấp JWT token có thời hạn 24 giờ cùng thông tin số dư và hồ sơ người chơi.
4. WHEN Người_Chơi đăng nhập sai thông tin 5 lần liên tiếp, THE Auth_Service SHALL khóa tài khoản tạm thời trong 15 phút và ghi nhận sự kiện bảo mật.
5. WHEN JWT token hết hạn không quá 5 phút và Người_Chơi gửi yêu cầu refresh với token cũ chưa bị thu hồi, THE Auth_Service SHALL cấp JWT token mới có thời hạn 24 giờ và vô hiệu hóa token cũ.
6. IF Người_Chơi gửi yêu cầu với JWT token không hợp lệ hoặc đã hết hạn quá 5 phút, THEN THE Auth_Service SHALL từ chối yêu cầu và trả về mã lỗi 401.
7. THE Auth_Service SHALL ghi nhật ký (audit log) toàn bộ sự kiện đăng nhập, bất kể thành công hay thất bại, bao gồm địa chỉ IP và thông tin thiết bị.

---

### Yêu Cầu 2: Quản Lý Hồ Sơ và Xác Minh KYC

**User Story:** Là một Người_Chơi, tôi muốn quản lý thông tin cá nhân và hoàn tất xác minh KYC, để có thể thực hiện giao dịch tài chính và truy cập đầy đủ tính năng game.

#### Tiêu Chí Chấp Nhận

1. THE Game_Client SHALL hiển thị hồ sơ người chơi bao gồm số dư hiện tại, tổng nạp, tổng rút, tổng thắng, tổng thua, cấp độ và điểm kinh nghiệm.
2. WHEN Người_Chơi cập nhật thông tin hồ sơ (ngôn ngữ ưa thích, thông tin liên hệ), THE Auth_Service SHALL lưu thay đổi và phản ánh ngay lập tức trên giao diện.
3. WHEN Người_Chơi gửi hồ sơ KYC hợp lệ, THE Auth_Service SHALL cập nhật trạng thái kycVerified thành TRUE và mở khóa giới hạn giao dịch cao hơn.
4. IF Người_Chơi chưa xác minh KYC cố gắng thực hiện giao dịch vượt giới hạn cho phép, THEN THE Payment_Service SHALL từ chối giao dịch và hướng dẫn người chơi hoàn tất KYC.
5. THE Auth_Service SHALL theo dõi danh sách thiết bị đăng nhập (platform: WEB, iOS, ANDROID) và lưu thông tin lần truy cập cuối cho mỗi thiết bị.

---

### Yêu Cầu 3: Quản Lý Phòng Game

**User Story:** Là một Người_Chơi, tôi muốn tham gia vào các phòng game phù hợp với mức cược của mình, để có trải nghiệm chơi công bằng và thú vị.

#### Tiêu Chí Chấp Nhận

1. THE Game_Client SHALL hiển thị danh sách các phòng game có sẵn phân loại theo loại phòng: NORMAL_ROOM, VIP_ROOM và TOURNAMENT_ROOM, kèm thông tin mức cược tối thiểu/tối đa và số người đang chơi.
2. WHEN Người_Chơi yêu cầu vào phòng và đáp ứng điều kiện (số dư đủ, phòng chưa đầy, tài khoản ACTIVE), THE Game_Engine SHALL thêm người chơi vào phòng và gửi trạng thái game ban đầu.
3. IF Người_Chơi có số dư thấp hơn mức cược tối thiểu của phòng cố gắng tham gia, THEN THE Game_Engine SHALL từ chối và trả về thông báo yêu cầu nạp thêm tiền.
4. WHILE Người_Chơi đang trong phòng, THE WebSocket_Server SHALL duy trì kết nối thời gian thực và đồng bộ trạng thái game với độ trễ dưới 50ms (P99).
5. WHEN Người_Chơi mất kết nối WebSocket, THE Game_Engine SHALL giữ người chơi trong phòng trong 30 giây và lưu trạng thái game, cho phép kết nối lại và khôi phục phiên chơi.
6. IF Người_Chơi không kết nối lại sau 30 giây ngắt kết nối, THEN THE Game_Engine SHALL tự động rời phòng cho người chơi và thông báo cho các người chơi còn lại.
7. THE Game_Engine SHALL hỗ trợ tối đa 5.000 người dùng đồng thời trên mỗi server instance.

---

### Yêu Cầu 4: Logic Bắn Đạn và Phát Hiện Va Chạm

**User Story:** Là một Người_Chơi, tôi muốn các lượt bắn được xử lý chính xác và công bằng theo thời gian thực, để kết quả game phản ánh đúng kỹ năng của tôi.

#### Tiêu Chí Chấp Nhận

1. WHEN Người_Chơi kích hoạt lệnh bắn hợp lệ (có số dư đủ, tần suất ≤ 10 shots/giây), THE Game_Engine SHALL xử lý sự kiện và trả về kết quả va chạm trong vòng 10ms.
2. THE Game_Engine SHALL phát hiện va chạm theo phương pháp deterministic: cùng một đầu vào (vị trí đạn, mục tiêu) luôn cho kết quả va chạm giống nhau.
3. IF số dư của Người_Chơi không đủ để bắn, THEN THE Game_Engine SHALL từ chối sự kiện bắn và thông báo số dư không đủ mà không thay đổi trạng thái game.
4. IF tần suất bắn của Người_Chơi vượt quá 10 shots/giây, THEN THE Game_Engine SHALL từ chối các lượt bắn vượt giới hạn và áp dụng rate limiting.
5. IF timestamp của sự kiện bắn lệch hơn 500ms so với thời gian server, THEN THE Game_Engine SHALL từ chối sự kiện để ngăn chặn gian lận lag-abuse.
6. WHEN viên đạn trúng mục tiêu và gây sát thương, THE Game_Engine SHALL trừ health của mục tiêu, tính phần thưởng và cập nhật số dư người chơi trong cùng một giao dịch atomic.
7. WHEN một mục tiêu bị tiêu diệt, THE Game_Engine SHALL đảm bảo phần thưởng chỉ được tính và cộng đúng một lần, dù có nhiều người chơi bắn cùng lúc.
8. THE Game_Engine SHALL broadcast kết quả của mỗi sự kiện bắn tới tất cả người chơi trong phòng ngay sau khi xử lý.

---

### Yêu Cầu 5: Hệ Thống Máy Bay và Boss

**User Story:** Là một Người_Chơi, tôi muốn đối mặt với nhiều loại máy bay và boss đa dạng, để trải nghiệm game phong phú và có cơ hội nhận phần thưởng lớn.

#### Tiêu Chí Chấp Nhận

1. THE Game_Engine SHALL spawn máy bay theo bốn loại cơ bản: FIGHTER, BOMBER, SCOUT và STEALTH, mỗi loại có tỷ lệ xuất hiện (spawnWeight), máu, tốc độ và phần thưởng riêng biệt.
2. THE Game_Engine SHALL spawn boss theo ba loại: MINI_BOSS, MEGA_BOSS và JACKPOT_BOSS, mỗi loại có điều kiện kích hoạt (triggerCondition) và hệ số nhân jackpot riêng.
3. WHEN boss MEGA_BOSS hoặc JACKPOT_BOSS xuất hiện, THE Game_Engine SHALL thông báo toàn bộ người chơi trong phòng qua sự kiện BOSS_SPAWN kèm vị trí xuất hiện.
4. WHILE boss còn sống và máu giảm đến các ngưỡng xác định, THE Game_Engine SHALL chuyển boss sang giai đoạn chiến đấu mới (BossPhase) và broadcast sự kiện BOSS_PHASE.
5. THE Game_Engine SHALL tính số lượng máy bay spawn dựa trên số người chơi hiện tại trong phòng và không vượt quá giới hạn tối đa cấu hình.
6. WHERE phòng có sự kiện khuyến mãi SPECIAL_BOSS đang hoạt động, THE Game_Engine SHALL tăng tỷ lệ xuất hiện boss theo hệ số nhân của khuyến mãi.
7. THE Game_Engine SHALL hỗ trợ bảy loại máy bay mở rộng: CARRIER, ARMORED, SPEEDER, SHIELD_PLANE, HEALING_PLANE, DECOY_PLANE và DRAGON, mỗi loại có cơ chế gameplay độc đáo riêng biệt.
8. WHEN CARRIER bị tiêu diệt, THE Game_Engine SHALL spawn từ 2 đến 4 máy bay con loại FIGHTER vào màn hình với tốc độ tăng 20% so với FIGHTER thông thường.
9. WHILE ARMORED còn sống, THE Game_Engine SHALL giảm 50% sát thương từ tất cả loại đạn ngoại trừ đạn xuyên giáp (Armor_Piercing) và đạn plasma (Plasma).
10. WHEN SPEEDER xuất hiện, THE Game_Engine SHALL hiển thị SPEEDER với thời gian tồn tại tối đa 8 giây và tốc độ di chuyển gấp 3 lần FIGHTER; IF không bị tiêu diệt trong 8 giây THEN THE Game_Engine SHALL xóa SPEEDER khỏi màn hình.
11. WHILE SHIELD_PLANE còn khiên (shieldHealth > 0), THE Game_Engine SHALL chặn toàn bộ sát thương lên thân máy bay; WHEN khiên bị phá vỡ (shieldHealth = 0), THE Game_Engine SHALL broadcast sự kiện SHIELD_BROKEN và cho phép gây sát thương thân bình thường.
12. WHILE HEALING_PLANE còn sống, THE Game_Engine SHALL hồi 5% maxHealth mỗi 2 giây cho tất cả máy bay thường trong vùng bán kính 150 đơn vị quanh HEALING_PLANE.
13. WHEN DECOY_PLANE bị bắn lần đầu, THE Game_Engine SHALL tạo 3 bản sao giả (decoy) di chuyển ngẫu nhiên; chỉ 1 bản thật mang toàn bộ điểm thưởng, các bản giả cho điểm thưởng bằng 0 khi bị tiêu diệt.
14. THE Game_Engine SHALL spawn DRAGON với chỉ số máu gấp 5 lần MEGA_BOSS và tặng thưởng jackpot_multiplier tối thiểu 3x khi bị tiêu diệt; DRAGON xuất hiện theo chu kỳ sự kiện cấu hình bởi Admin.
15. THE Game_Engine SHALL spawn LUCKY_WHEEL_PLANE theo lịch trình cấu hình hoặc ngẫu nhiên với xác suất không thấp hơn 1 lần mỗi 10 phút trong một phòng đang hoạt động.

---

### Yêu Cầu 6: Cơ Chế Nổ Hũ (Jackpot)

**User Story:** Là một Người_Chơi, tôi muốn có cơ hội nhận jackpot khi tiêu diệt boss, để trải nghiệm cảm giác hồi hộp và nhận phần thưởng lớn.

#### Tiêu Chí Chấp Nhận

1. WHEN boss thuộc loại MINI_BOSS, MEGA_BOSS hoặc JACKPOT_BOSS bị tiêu diệt, THE Jackpot_Module SHALL kiểm tra xác suất nổ hũ dựa trên loại boss và mức quỹ tích lũy hiện tại.
2. THE Jackpot_Module SHALL đảm bảo quỹ jackpot (jackpotPool) không bao giờ thấp hơn mức tối thiểu cấu hình (minJackpotPool) tại mọi thời điểm.
3. WHEN jackpot kích hoạt, THE Jackpot_Module SHALL xác định danh sách người thắng là tập con của người chơi hiện tại trong phòng, và tổng phần trăm chia phần thưởng phải bằng 100%.
4. WHEN jackpot kích hoạt, THE Jackpot_Module SHALL phân phối phần thưởng cho người thắng bằng cơ chế khóa (lock) để tránh race condition khi nhiều boss cùng bị tiêu diệt đồng thời.
5. WHEN jackpot được phân phối, THE Jackpot_Module SHALL reset quỹ jackpot về mức tối thiểu và broadcast sự kiện JACKPOT_EVENT kèm thông tin người thắng và số tiền tới toàn phòng.
6. WHEN boss bị tiêu diệt nhưng không kích hoạt jackpot, THE Jackpot_Module SHALL cộng một phần đóng góp (contribution) vào quỹ jackpot tích lũy.
7. WHERE phòng có sự kiện khuyến mãi JACKPOT_BOOST đang hoạt động, THE Jackpot_Module SHALL nhân xác suất nổ hũ với hệ số của khuyến mãi, giới hạn tối đa 100%.

---

### Yêu Cầu 7: Bảng Xếp Hạng

**User Story:** Là một Người_Chơi, tôi muốn xem thứ hạng của mình so với người chơi khác, để có động lực cạnh tranh và cải thiện kỹ năng.

#### Tiêu Chí Chấp Nhận

1. THE Game_Engine SHALL duy trì bảng xếp hạng theo bốn khung thời gian: DAILY, WEEKLY, MONTHLY và ALL_TIME, được cập nhật trong thời gian thực sau mỗi sự kiện ghi điểm.
2. WHEN điểm số của Người_Chơi được cập nhật, THE Game_Engine SHALL cập nhật thứ hạng nguyên tử (atomic) trong Redis Sorted Set và trả về thứ hạng mới cùng thứ hạng trước đó.
3. WHEN Người_Chơi đạt vào TOP 10 bảng xếp hạng, THE Game_Engine SHALL broadcast thông báo toàn server.
4. THE Game_Engine SHALL trả về kết quả bảng xếp hạng từ cache Redis trước, với fallback sang cơ sở dữ liệu khi cache miss, và kết quả trả về tối đa 100 mục mỗi lần.
5. THE Game_Client SHALL hiển thị thứ hạng hiện tại của người chơi đang xem ngay cả khi người đó không nằm trong top danh sách hiển thị.

---

### Yêu Cầu 8: Nạp Tiền Tự Động

**User Story:** Là một Người_Chơi, tôi muốn nạp tiền vào tài khoản nhanh chóng qua ngân hàng và ví điện tử, để có thể tham gia game ngay mà không bị gián đoạn.

#### Tiêu Chí Chấp Nhận

1. WHEN Người_Chơi đã xác minh KYC yêu cầu nạp tiền với số tiền từ 50.000 VNĐ đến 500.000.000 VNĐ và chọn phương thức hợp lệ (BANK_TRANSFER, MOMO, ZALOPAY), THE Payment_Service SHALL tạo lệnh thanh toán trạng thái PENDING với URL/QR thanh toán có hiệu lực trong 15 phút.
2. THE Payment_Service SHALL hỗ trợ các ngân hàng: Vietcombank, Techcombank, MB Bank; và các ví điện tử: MoMo, ZaloPay.
3. IF tổng số tiền nạp trong ngày của Người_Chơi vượt 1.000.000.000 VNĐ, THEN THE Payment_Service SHALL từ chối lệnh nạp mới và thông báo đã đạt giới hạn ngày.
4. WHEN callback thanh toán từ provider được nhận với chữ ký HMAC-SHA256 hợp lệ và trạng thái success, THE Payment_Service SHALL cộng số tiền vào số dư người chơi và cập nhật giao dịch sang trạng thái SUCCESS trong cùng một giao dịch atomic.
5. THE Payment_Service SHALL đảm bảo idempotency: xử lý nhiều lần callback có cùng orderId chỉ cập nhật số dư đúng một lần.
6. IF callback thanh toán có chữ ký HMAC-SHA256 không hợp lệ, THEN THE Payment_Service SHALL từ chối callback, ghi log cảnh báo bảo mật và thông báo cho Admin.
7. WHEN lệnh nạp tiền PENDING quá 15 phút không được xác nhận, THE Payment_Service SHALL tự động hủy lệnh và chuyển trạng thái sang CANCELLED.

---

### Yêu Cầu 9: Rút Tiền Tự Động

**User Story:** Là một Người_Chơi, tôi muốn rút tiền thắng về tài khoản ngân hàng một cách an toàn và nhanh chóng, để nhận phần thưởng một cách thực sự.

#### Tiêu Chí Chấp Nhận

1. WHEN Người_Chơi đã xác minh KYC yêu cầu rút tiền với số tiền không vượt quá số dư khả dụng (balance - frozenBalance), THE Payment_Service SHALL tạo lệnh rút tiền và tạm khóa số tiền vào frozenBalance.
2. THE Payment_Service SHALL không cho phép tổng số tiền rút khiến balance khả dụng trở thành âm tại bất kỳ thời điểm nào.
3. WHEN lệnh rút tiền được xử lý thành công bởi ngân hàng/ví, THE Payment_Service SHALL giải phóng frozenBalance, trừ balance, và cập nhật giao dịch sang SUCCESS.
4. IF lệnh rút tiền thất bại ở phía ngân hàng/ví, THEN THE Payment_Service SHALL giải phóng frozenBalance về balance (hoàn tiền) và cập nhật giao dịch sang FAILED.
5. THE Payment_Service SHALL ghi nhận đầy đủ thông tin ngân hàng của người nhận (mã hóa AES-256) vào mỗi giao dịch rút tiền để đối soát.

---

### Yêu Cầu 10: Lịch Sử Giao Dịch

**User Story:** Là một Người_Chơi, tôi muốn xem lịch sử các giao dịch tài chính của mình, để theo dõi thu chi và kiểm tra tình trạng các lệnh đang xử lý.

#### Tiêu Chí Chấp Nhận

1. THE Payment_Service SHALL cung cấp lịch sử giao dịch của Người_Chơi bao gồm tất cả loại: DEPOSIT, WITHDRAW, WIN, LOSE, BONUS, REFUND với trạng thái, số tiền, thời gian và phương thức thanh toán.
2. WHEN Người_Chơi truy vấn lịch sử giao dịch với bộ lọc (khoảng thời gian, loại giao dịch, trạng thái), THE Payment_Service SHALL trả về danh sách kết quả phân trang chính xác theo bộ lọc.
3. THE Payment_Service SHALL lưu trữ toàn bộ lịch sử giao dịch trong PostgreSQL với đầy đủ thông tin truy xuất gốc (providerOrderId, providerRef) để đối soát khi cần thiết.

---

### Yêu Cầu 11: Sự Kiện Khuyến Mãi

**User Story:** Là một Người_Chơi, tôi muốn tham gia các sự kiện khuyến mãi hấp dẫn, để nhận thêm phần thưởng và tăng trải nghiệm chơi game.

#### Tiêu Chí Chấp Nhận

1. THE Game_Client SHALL hiển thị danh sách các sự kiện khuyến mãi đang hoạt động (status = ACTIVE) kèm thông tin điều kiện, phần thưởng, thời gian bắt đầu và kết thúc.
2. WHEN Người_Chơi đáp ứng điều kiện tham gia sự kiện và yêu cầu nhận thưởng, THE Game_Engine SHALL kiểm tra điều kiện, áp dụng phần thưởng và cập nhật số người tham gia.
3. IF số người tham gia sự kiện đã đạt maxParticipants, THEN THE Game_Engine SHALL từ chối yêu cầu nhận thưởng mới và thông báo sự kiện đã hết chỗ.
4. WHEN thời gian kết thúc của sự kiện được đạt đến, THE Game_Engine SHALL tự động chuyển trạng thái khuyến mãi sang EXPIRED và dừng áp dụng hiệu ứng sự kiện.
5. THE Game_Engine SHALL hỗ trợ các loại khuyến mãi: DEPOSIT_BONUS (thưởng nạp), CASHBACK (hoàn tiền), FREE_BULLETS (đạn miễn phí), DOUBLE_XP (nhân đôi kinh nghiệm), SPECIAL_BOSS (tăng boss đặc biệt).

---

### Yêu Cầu 12: Đa Ngôn Ngữ

**User Story:** Là một Người_Chơi, tôi muốn sử dụng game bằng ngôn ngữ mẹ đẻ của mình, để hiểu rõ tất cả thông tin và hướng dẫn trong game.

#### Tiêu Chí Chấp Nhận

1. THE i18n_Service SHALL hỗ trợ ba ngôn ngữ: Tiếng Việt (VI), Tiếng Anh (EN) và Tiếng Thái (TH).
2. WHEN Người_Chơi thay đổi ngôn ngữ ưa thích, THE Game_Client SHALL hiển thị toàn bộ giao diện, thông báo hệ thống và nội dung game bằng ngôn ngữ đã chọn mà không cần tải lại trang.
3. IF khóa dịch thuật không tồn tại trong ngôn ngữ được chọn, THEN THE i18n_Service SHALL fallback sang Tiếng Việt; nếu cũng không có trong Tiếng Việt, SHALL trả về khóa gốc.
4. THE i18n_Service SHALL cache kết quả dịch thuật trong bộ nhớ với TTL 1 giờ để tối ưu hiệu năng.
5. THE i18n_Service SHALL hỗ trợ nội suy tham số động trong chuỗi dịch thuật (vd: "Chúc mừng {playerName} trúng jackpot {amount} VNĐ").

---

### Yêu Cầu 13: Giao Diện Game 3D Đa Nền Tảng

**User Story:** Là một Người_Chơi, tôi muốn trải nghiệm đồ họa 3D mượt mà trên cả Web lẫn thiết bị di động, để có thể chơi game ở bất kỳ đâu với chất lượng tốt nhất.

#### Tiêu Chí Chấp Nhận

1. THE Game_Client SHALL render đồ họa 3D với Three.js/WebGL trên nền tảng Web (trình duyệt), iOS (React Native + WebView) và Android (React Native + WebView).
2. THE Game_Client SHALL tải game lần đầu trong vòng 3 giây bằng cách tải trước (preload) các asset quan trọng (background, máy bay người chơi, đạn) trước khi hiển thị giao diện.
3. THE Game_Client SHALL nén dữ liệu game state bằng MessagePack và chỉ gửi delta (thay đổi) thay vì toàn bộ trạng thái, giảm băng thông tối thiểu 70%.
4. THE Game_Client SHALL hỗ trợ ba loại đầu vào: chuột (Web), cảm ứng ngón tay (iOS/Android) và bàn phím (Web).
5. THE Game_Client SHALL hiển thị thông tin thời gian thực: điểm số hiện tại, số dư, bảng xếp hạng trong phòng và thông báo sự kiện.

---

### Yêu Cầu 14: Bảo Mật Hệ Thống

**User Story:** Là một Admin, tôi muốn hệ thống được bảo vệ toàn diện trước các tấn công, để đảm bảo tính toàn vẹn của dữ liệu tài chính và trải nghiệm công bằng cho người chơi.

#### Tiêu Chí Chấp Nhận

1. THE Security_Layer SHALL bảo vệ tất cả endpoint API bằng JWT; mọi yêu cầu không có JWT hợp lệ SHALL nhận phản hồi mã lỗi 401.
2. THE Security_Layer SHALL áp dụng phân quyền role-based: chỉ tài khoản có quyền ADMIN mới truy cập được các endpoint `/api/v1/admin/*`.
3. THE Security_Layer SHALL mã hóa tất cả dữ liệu nhạy cảm (số tài khoản ngân hàng, số điện thoại) bằng AES-256-GCM với key riêng cho từng người dùng.
4. THE Security_Layer SHALL xác thực tất cả callback thanh toán bằng chữ ký HMAC-SHA256 với secret key của từng provider trước khi xử lý.
5. THE Security_Layer SHALL áp dụng rate limiting cho mọi endpoint và WebSocket connection; vượt giới hạn SHALL nhận mã lỗi 429.
6. THE Security_Layer SHALL validate và sanitize tất cả đầu vào từ client để ngăn chặn SQL Injection, XSS và các tấn công injection khác.
7. WHEN phát hiện callback thanh toán giả mạo, THE Security_Layer SHALL từ chối, ghi log cảnh báo bảo mật, thông báo Admin và thực hiện IP block tạm thời.
8. THE Security_Layer SHALL bảo vệ toàn bộ hệ thống qua lớp WAF/DDoS protection (CloudFlare) trước khi traffic đến load balancer.
9. THE Security_Layer SHALL yêu cầu TLS 1.3 cho tất cả kết nối HTTP và WebSocket.
10. THE Security_Layer SHALL validate timestamp trong mỗi request WebSocket game; yêu cầu có timestamp lệch hơn 500ms so với server time SHALL bị từ chối để ngăn replay attack.

---

### Yêu Cầu 15: Toàn Vẹn Tài Chính

**User Story:** Là một Admin, tôi muốn hệ thống đảm bảo tính toàn vẹn tuyệt đối của dữ liệu tài chính, để ngăn ngừa mất mát tiền và gian lận trong toàn hệ thống.

#### Tiêu Chí Chấp Nhận

1. THE Payment_Service SHALL đảm bảo tổng số dư của toàn hệ thống không thay đổi sau mỗi chuỗi sự kiện game: tổng số dư trước và sau khi xử lý các sự kiện WIN/LOSE phải bằng nhau (tiền thưởng từ quỹ game bù trừ tiền thua của người chơi).
2. THE Payment_Service SHALL ghi lại toàn bộ giao dịch tài chính vào PostgreSQL trong bảng append-only không thể xóa, bao gồm loại giao dịch, số tiền, địa chỉ IP và timestamp.
3. THE Payment_Service SHALL thực hiện đối soát giao dịch tự động hàng ngày giữa dữ liệu nội bộ và dữ liệu từ ngân hàng/ví điện tử, tạo báo cáo chênh lệch nếu có.
4. THE Auth_Service SHALL ghi audit log cho mọi hành động tài chính và hành động của Admin; audit log là append-only và không thể sửa/xóa.
5. WHEN xảy ra lỗi payment timeout (PAY_001), THE Payment_Service SHALL hủy đơn hàng và hoàn tiền về frozenBalance nếu số tiền đã bị tạm giữ.

---

### Yêu Cầu 16: Bảng Điều Khiển Quản Trị (Admin Panel)

**User Story:** Là một Admin, tôi muốn có giao diện quản trị toàn diện, để giám sát doanh thu, quản lý người chơi và điều hành hệ thống hiệu quả.

#### Tiêu Chí Chấp Nhận

1. THE Admin_Service SHALL cung cấp dashboard tổng quan với số liệu cập nhật real-time: doanh thu, người chơi đang online, tổng giao dịch trong ngày và trạng thái hệ thống.
2. WHEN Admin truy vấn báo cáo doanh thu với bộ lọc (khoảng ngày tối đa 365 ngày, loại phòng, phương thức thanh toán), THE Admin_Service SHALL trả về báo cáo bao gồm: tổng doanh thu, timeline theo ngày/tuần/tháng, top 50 người chơi theo doanh thu, phân tích theo phương thức thanh toán và thống kê jackpot.
3. THE Admin_Service SHALL hỗ trợ xuất báo cáo ra định dạng XLSX, CSV và PDF.
4. WHEN Admin khóa tài khoản người chơi với lý do cụ thể, THE Admin_Service SHALL ngay lập tức vô hiệu hóa JWT hiện tại của người chơi đó, chuyển trạng thái sang BANNED và ghi audit log.
5. THE Admin_Service SHALL cho phép Admin tạo, chỉnh sửa, tạm dừng (PAUSE) và kết thúc sớm (EXPIRE) sự kiện khuyến mãi, với hiệu lực áp dụng ngay cho các phòng game liên quan.
6. THE Admin_Service SHALL cung cấp endpoint kiểm tra sức khỏe hệ thống (system health) trả về trạng thái của tất cả thành phần: database, cache, message queue và payment gateway.
7. THE Admin_Service SHALL nhận stream sự kiện giao dịch từ Kafka và cập nhật dashboard doanh thu theo thời gian thực mà không cần làm mới trang.

---

### Yêu Cầu 17: Hiệu Năng và Khả Năng Mở Rộng

**User Story:** Là một Admin, tôi muốn hệ thống đáp ứng được tải lớn và duy trì hiệu năng cao, để đảm bảo trải nghiệm mượt mà cho hàng nghìn người chơi đồng thời.

#### Tiêu Chí Chấp Nhận

1. THE WebSocket_Server SHALL đảm bảo độ trễ cập nhật trạng thái game (game state update) dưới 50ms ở mức P99 trong điều kiện tải bình thường.
2. THE Game_Engine SHALL xử lý sự kiện bắn đạn trong vòng 10ms trên server.
3. THE Game_Client SHALL hiển thị giao diện game lần đầu trong vòng 3 giây trên kết nối internet tiêu chuẩn.
4. THE Payment_Service SHALL xử lý tối thiểu 500 giao dịch thanh toán mỗi giây (TPS).
5. THE System SHALL đạt uptime 99,9% được đo theo tháng.
6. THE System SHALL hỗ trợ tối thiểu 5.000 người dùng đồng thời trên mỗi server instance thông qua kiến trúc WebSocket cluster với Redis pub/sub.
7. THE Admin_Service SHALL trả về kết quả báo cáo doanh thu được cache trong Redis với TTL 5 phút để giảm tải cơ sở dữ liệu.

---

### Yêu Cầu 18: Xử Lý Lỗi và Phục Hồi

**User Story:** Là một Người_Chơi và Admin, tôi muốn hệ thống xử lý lỗi gracefully và tự phục hồi khi có sự cố, để đảm bảo tính liên tục của dịch vụ.

#### Tiêu Chí Chấp Nhận

1. IF kết nối cơ sở dữ liệu gặp lỗi (DB_001), THEN THE System SHALL tự động retry tối đa 3 lần với backoff và fallback sang cache Redis nếu có thể.
2. WHEN Người_Chơi mất kết nối WebSocket, THE WebSocket_Server SHALL tự động reconnect và khôi phục trạng thái phiên chơi nếu người chơi kết nối lại trong vòng 30 giây.
3. IF rate limit bị vượt (SYS_001), THEN THE System SHALL trả về mã lỗi 429 và áp dụng backoff exponential cho các yêu cầu tiếp theo.
4. IF xảy ra lỗi timeout thanh toán (PAY_001), THEN THE Payment_Service SHALL hủy đơn hàng và hoàn trả toàn bộ số tiền đã bị tạm giữ (frozenBalance) về số dư khả dụng (balance).
5. THE System SHALL ghi log đầy đủ cho mọi lỗi xảy ra với mức độ phân loại (ERROR, WARN, INFO) để hỗ trợ chẩn đoán và khắc phục sự cố.

---

### Yêu Cầu 19: Hệ Thống Quà Ngẫu Nhiên (Drop System)

**User Story:** Là một Người_Chơi, tôi muốn nhận quà ngẫu nhiên khi bắn hạ máy bay, để có thêm phần thưởng bất ngờ và tăng sự hứng thú trong mỗi ván chơi.

#### Tiêu Chí Chấp Nhận

1. WHEN một máy bay bị tiêu diệt, THE Drop_System SHALL tính xác suất thả quà dựa trên loại máy bay: BOSS-type ≥ 80%, DRAGON ≥ 90%, FIGHTER 10%, BOMBER 15%, SCOUT 8%, STEALTH 12%, CARRIER 25%, ARMORED 20%, SPEEDER 30%, SHIELD_PLANE 22%, HEALING_PLANE 18%, DECOY_PLANE 5% (chỉ bản thật).
2. WHEN Drop_System quyết định thả quà, THE Drop_System SHALL chọn ngẫu nhiên một loại quà từ danh sách: đạn tăng cường (30%), đạn đặc biệt miễn phí (15%), nhân đôi điểm trong 30 giây (10%), nhân đôi phần thưởng tiền trong 30 giây (10%), hồi máu shield 20% (10%), tốc độ bắn x2 trong 15 giây (12%), skill charge đầy (8%), jackpot token tăng xác suất nổ hũ 5 phút (5%).
3. WHEN quà xuất hiện trên màn hình, THE Game_Client SHALL hiển thị vật phẩm rơi dưới dạng item 3D có animation rơi xuống từ vị trí máy bay bị tiêu diệt, biến mất sau 10 giây nếu không được nhặt.
4. WHEN Người_Chơi bắn trúng vật phẩm quà đang rơi, THE Drop_System SHALL áp dụng hiệu ứng quà ngay lập tức cho người chơi đó và phát animation thu thập quà, đồng thời broadcast thông báo người chơi nhặt quà tới phòng.
5. IF nhiều người chơi bắn trúng cùng một vật phẩm quà trong cùng 100ms, THEN THE Drop_System SHALL cấp quà cho người chơi có timestamp bắn trúng sớm nhất và bỏ qua các lần bắn sau.
6. THE Drop_System SHALL ghi nhận lịch sử nhặt quà của mỗi người chơi và cập nhật thống kê tổng quà nhặt được vào hồ sơ người chơi.

---

### Yêu Cầu 20: Vũ Khí Đặc Biệt và Power-ups

**User Story:** Là một Người_Chơi, tôi muốn sử dụng các vũ khí đặc biệt mạnh mẽ để tiêu diệt nhiều mục tiêu cùng lúc, để tăng hiệu quả chiến đấu và nhận phần thưởng lớn hơn.

#### Tiêu Chí Chấp Nhận

1. THE Power_Up_System SHALL cung cấp năm loại vũ khí đặc biệt: Screen_Bomb (cooldown 60 giây), Homing_Missile (cooldown 20 giây), Lightning_Chain (cooldown 15 giây), Electric_Net (cooldown 25 giây) và Piercing_Laser (cooldown 30 giây), mỗi loại có chi phí kích hoạt riêng.
2. WHEN Người_Chơi kích hoạt Screen_Bomb, THE Power_Up_System SHALL tiêu diệt tất cả máy bay đang sống trên màn hình (không bao gồm boss), tính toàn bộ phần thưởng cho người kích hoạt và phát animation nổ toàn màn hình trong 2 giây.
3. WHEN Người_Chơi kích hoạt Homing_Missile, THE Power_Up_System SHALL tự động nhắm vào mục tiêu có tổng giá trị phần thưởng cao nhất hiện có, xuyên qua tối đa 3 mục tiêu liên tiếp theo thứ tự giá trị giảm dần và tính phần thưởng đầy đủ cho mỗi mục tiêu bị tiêu diệt.
4. WHEN Người_Chơi kích hoạt Lightning_Chain, THE Power_Up_System SHALL bắn tia sét tấn công tối đa 5 mục tiêu gần nhau, sát thương giảm 20% cho mỗi mục tiêu tiếp theo (mục tiêu 1: 100%, mục tiêu 2: 80%, ..., mục tiêu 5: 20%).
5. WHEN Người_Chơi kích hoạt Electric_Net, THE Power_Up_System SHALL làm chậm tốc độ di chuyển của tất cả máy bay trong vùng bán kính 200 đơn vị xuống còn 30% trong 5 giây và hiển thị hiệu ứng lưới điện bao phủ vùng đó trên màn hình của tất cả người chơi trong phòng.
6. WHEN Người_Chơi kích hoạt Piercing_Laser, THE Power_Up_System SHALL bắn một tia laser xuyên suốt màn hình theo hướng ngắm của người chơi, tấn công tất cả mục tiêu trên đường đi và tính sát thương đầy đủ cho từng mục tiêu.
7. THE Power_Up_System SHALL hỗ trợ nâng cấp mỗi vũ khí lên cấp 2 và cấp 3 bằng điểm kinh nghiệm; mỗi cấp nâng tăng 30% sát thương và giảm 15% cooldown so với cấp trước.
8. WHILE vũ khí đang trong trạng thái cooldown, THE Game_Client SHALL hiển thị thanh cooldown trực quan và không cho phép Người_Chơi kích hoạt vũ khí đó.

---

### Yêu Cầu 21: Máy Bay Chứa Vòng Quay May Mắn (Lucky Wheel)

**User Story:** Là một Người_Chơi, tôi muốn tham gia vòng quay may mắn khi tiêu diệt LUCKY_WHEEL_PLANE, để có cơ hội nhận phần thưởng đặc biệt dựa trên đóng góp chiến đấu của mình.

#### Tiêu Chí Chấp Nhận

1. THE Game_Engine SHALL spawn LUCKY_WHEEL_PLANE ít nhất một lần mỗi 10 phút trong mỗi phòng đang có người chơi, hoặc theo lịch sự kiện do Admin cấu hình; LUCKY_WHEEL_PLANE được thông báo trước 10 giây khi sắp xuất hiện.
2. WHEN LUCKY_WHEEL_PLANE bị tiêu diệt, THE Lucky_Wheel SHALL kích hoạt vòng quay may mắn cho toàn phòng với animation 3D quay bánh xe và kết quả hiển thị sau 5 đến 8 giây.
3. THE Lucky_Wheel SHALL có sáu ô kết quả: jackpot nhỏ (5% xác suất), jackpot lớn (1% xác suất), đạn đặc biệt x10 (20% xác suất), nhân 2x thưởng trong 30 giây (25% xác suất), quà ngẫu nhiên từ Drop_System (35% xác suất), mất lượt – không nhận gì (14% xác suất).
4. THE Lucky_Wheel SHALL tính tỷ lệ thắng của mỗi người chơi dựa trên phần trăm sát thương đóng góp vào LUCKY_WHEEL_PLANE: người chơi gây 40% sát thương có tỷ lệ thắng 40%, người không tham chiến có tỷ lệ 0%.
5. WHEN vòng quay dừng và xác định kết quả, THE Lucky_Wheel SHALL phân phối phần thưởng cho người chơi thắng trong vòng 2 giây và broadcast kết quả (tên người thắng, phần thưởng) tới toàn phòng.
6. IF phòng có ít hơn 2 người chơi khi LUCKY_WHEEL_PLANE bị tiêu diệt, THEN THE Lucky_Wheel SHALL tự động cấp phần thưởng nhỏ nhất (quà ngẫu nhiên) cho người tiêu diệt mà không cần quay.
7. THE Game_Client SHALL hiển thị animation vòng quay 3D mượt mà với âm thanh nền và hiệu ứng ánh sáng nổi bật trong suốt thời gian quay.

---

### Yêu Cầu 22: Hệ Thống Đạn Đa Dạng

**User Story:** Là một Người_Chơi, tôi muốn lựa chọn nhiều loại đạn khác nhau phù hợp với từng loại mục tiêu, để tối ưu chiến thuật và tăng hiệu quả tấn công.

#### Tiêu Chí Chấp Nhận

1. THE Game_Engine SHALL hỗ trợ bảy loại đạn: Normal (đạn cơ bản), Armor_Piercing (xuyên giáp), Explosive (nổ vùng), Ice (đóng băng), Fire (lửa DOT), Plasma (xuyên khiên), Golden (tăng thưởng); mỗi loại có chi phí khác nhau và được hiển thị rõ trong giao diện chọn đạn trước khi bắn.
2. WHEN Người_Chơi chọn loại đạn và kích hoạt lệnh bắn, THE Game_Engine SHALL áp dụng đúng thuộc tính của loại đạn đó: Armor_Piercing tăng 50% sát thương với ARMORED; Explosive gây sát thương cho tất cả mục tiêu trong bán kính 80 đơn vị; Ice làm chậm mục tiêu 30% trong 3 giây; Fire gây thêm 10% sát thương mỗi giây trong 3 giây (DOT); Plasma bỏ qua hoàn toàn khiên của SHIELD_PLANE; Golden nhân đôi tổng phần thưởng từ mục tiêu bị tiêu diệt.
3. WHEN đạn Ice tác động lên mục tiêu đang chịu hiệu ứng Lightning_Chain, THE Game_Engine SHALL nhân đôi thời gian chậm của đạn Ice lên 6 giây (hiệu ứng gộp Ice + Lightning).
4. IF Người_Chơi không đủ số dư để mua loại đạn đã chọn, THEN THE Game_Engine SHALL tự động chuyển về loại đạn Normal và thông báo cho Người_Chơi.
5. THE Game_Client SHALL hiển thị giao diện chọn đạn trực quan với thông tin chi phí, hiệu ứng và loại mục tiêu phù hợp cho mỗi loại đạn; trạng thái đạn đang được chọn phải nổi bật rõ ràng.
6. THE Game_Engine SHALL ghi nhận thống kê sử dụng đạn theo loại của mỗi người chơi để phục vụ phân tích hành vi và cân bằng game.

---

### Yêu Cầu 23: Hệ Thống Skill của Người Chơi

**User Story:** Là một Người_Chơi, tôi muốn sử dụng các kỹ năng đặc biệt được tích lũy từ quá trình chiến đấu, để tạo lợi thế tạm thời và đa dạng hóa chiến thuật của mình.

#### Tiêu Chí Chấp Nhận

1. THE Skill_System SHALL cung cấp cho mỗi Người_Chơi ba slot skill độc lập; Người_Chơi có thể gán bất kỳ skill nào từ danh sách: Rapid_Fire (cooldown 30 giây), Double_Damage (cooldown 45 giây), Auto_Target (cooldown 60 giây), Shield_Boost (cooldown 40 giây) và Gold_Rush (cooldown 90 giây).
2. WHEN Người_Chơi kích hoạt Rapid_Fire, THE Skill_System SHALL tăng tốc độ bắn của người chơi đó lên x3 trong 5 giây và bắt đầu đếm ngược cooldown 30 giây sau khi hiệu ứng kết thúc.
3. WHEN Người_Chơi kích hoạt Double_Damage, THE Skill_System SHALL nhân đôi toàn bộ sát thương gây ra bởi người chơi đó trong 8 giây và bắt đầu đếm ngược cooldown 45 giây.
4. WHEN Người_Chơi kích hoạt Auto_Target, THE Skill_System SHALL tự động ngắm và bắn vào mục tiêu gần nhất với tần suất 5 shots/giây trong 10 giây; chi phí đạn tự động trừ vào số dư người chơi theo loại đạn đang chọn.
5. WHEN Người_Chơi kích hoạt Shield_Boost, THE Skill_System SHALL nhân đôi xác suất nhặt được quà từ Drop_System trong 15 giây cho người chơi đó.
6. WHEN Người_Chơi kích hoạt Gold_Rush, THE Skill_System SHALL áp dụng hiệu ứng đạn Golden lên tất cả đạn bắn ra bởi người chơi đó trong 10 giây mà không tính thêm chi phí đạn Golden, và bắt đầu cooldown 90 giây.
7. THE Skill_System SHALL nạp năng lượng (energy) cho skill thông qua hành động bắn hạ máy bay: mỗi máy bay thường +1 energy, boss +5 energy, DRAGON +10 energy; khi energy đạt 100 thì một lượt dùng skill được nạp đầy (tối đa 3 lượt).
8. THE Skill_System SHALL cho phép nâng cấp mỗi skill bằng điểm kinh nghiệm: mỗi cấp nâng tăng 20% hiệu ứng và giảm 10% cooldown, tối đa cấp 5.
9. WHILE skill đang kích hoạt, THE Game_Client SHALL hiển thị icon skill đang sáng với thanh đếm ngược thời gian hiệu ứng; WHILE đang cooldown, SHALL hiển thị thanh cooldown mờ và không cho phép kích hoạt lại.

---

### Yêu Cầu 24: Cân Bằng và Toàn Vẹn Hệ Thống Mở Rộng

**User Story:** Là một Admin, tôi muốn đảm bảo rằng tất cả tính năng mới (quà, vũ khí, đạn, skill, vòng quay) hoạt động cân bằng và không ảnh hưởng đến tính toàn vẹn tài chính của hệ thống, để đảm bảo trải nghiệm công bằng và doanh thu bền vững.

#### Tiêu Chí Chấp Nhận

1. THE Game_Engine SHALL đảm bảo tổng giá trị phần thưởng phân phối từ Drop_System, Lucky_Wheel và Power_Up_System trong mỗi phòng không vượt quá 95% tổng chi phí đạn và phí tham gia của tất cả người chơi trong cùng phiên, duy trì RTP (Return to Player) trong khoảng 85% đến 95%.
2. THE Admin_Service SHALL cung cấp giao diện cấu hình tỷ lệ thả quà, xác suất các ô Lucky_Wheel, chi phí và cooldown của từng vũ khí đặc biệt, và hệ số cân bằng của từng loại đạn; thay đổi có hiệu lực ngay lập tức mà không cần khởi động lại server.
3. THE Game_Engine SHALL ghi log đầy đủ mọi sự kiện liên quan đến Drop_System, Lucky_Wheel, Power_Up_System, Bullet_Type và Skill_System, bao gồm: người chơi, loại sự kiện, giá trị phần thưởng, timestamp; lưu vào hệ thống phân tích để Admin giám sát bất thường.
4. IF phát hiện người chơi nhặt quà hoặc kích hoạt skill với tần suất bất thường (vượt giới hạn vật lý của game), THEN THE Security_Layer SHALL ghi cảnh báo gian lận, tạm khóa hành động của người chơi đó trong 60 giây và thông báo Admin.
5. THE Skill_System SHALL đảm bảo không có tổ hợp skill nào cho phép người chơi đạt tốc độ bắn thực tế vượt 30 shots/giây hoặc nhân hệ số thưởng tổng cộng vượt 4x so với bắn thường; nếu phát hiện tổ hợp vi phạm, THE Game_Engine SHALL áp dụng giới hạn trên.
6. WHEN Admin cập nhật cấu hình cân bằng game (tỷ lệ quà, chi phí đạn, hệ số skill), THE Admin_Service SHALL ghi audit log với thông tin Admin thực hiện, giá trị cũ, giá trị mới và timestamp; log không thể sửa/xóa.
