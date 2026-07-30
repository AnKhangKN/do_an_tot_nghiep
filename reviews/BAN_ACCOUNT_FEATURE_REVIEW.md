# Báo Cáo Review Tính Năng: Khóa & Kháng Cáo Tài Khoản (Ban Account)

> **Dự án:** Hệ Thống Cứu Hộ Khẩn Cấp Thời Gian Thực  
> **Package liên quan:** `server/` (Express.js), `web/` (React + Vite), `mobile/` (Flutter)  
> **Thời gian cập nhật:** Tháng 07/2026

---

## I. Mô tả tính năng

Khi Admin khóa tài khoản user (từ Web Admin):
1. User (cả Web và Mobile) **tự động logout ngay lập tức**
2. Hiển thị **thông báo khóa** kèm lý do
3. User có thể **gửi đơn kháng cáo** lên Admin
4. User **không thể đăng nhập lại** cho đến khi Admin mở khóa
5. Nếu user kill app (Mobile) hoặc đóng tab (Web) khi đang bị khóa, khi mở lại **vẫn bị chặn** và thấy thông báo khóa

---

## II. Kiến trúc & Luồng hoạt động

### 1. Luồng chính (Realtime - Socket)

```
Admin ban user (Web Admin)
        ↓
server/modules/admin/service/admin.service.js
        ↓
emit socket "user:banned" → room "user:${userId}"
        ↓
  ┌────────────────┬──────────────────────────┐
  │ Web            │ Mobile                   │
  │                │                          │
  │ socket.io-client│ socket_io_client         │
  │ App.jsx        │ BanSocket (module)        │
  │ dispatch(setBan)│ sessionController        │
  │ state.ban       │ .setBanned()             │
  │                │                          │
  │ BannedNotFound  │ BannedDialogWidget        │
  │ (modal)         │ (dialog)                 │
  └────────────────┴──────────────────────────┘
        ↓
User thấy lý do khóa + nút "Kháng cáo" + "Đã hiểu"
        ↓
"Kháng cáo" → POST /api/auth/appeal-ban (hoặc POST /api/appeals)
"Đã hiểu"  → clearAll() → logout → redirect Login
```

### 2. Luồng fallback (403 Interceptor)

Nếu socket không kịp gửi (network delay), API call tiếp theo của user sẽ trả về 403:
- **Web**: axios interceptor → dispatch `setBanned` → hiển thị BannedNotification
- **Mobile**: Dio interceptor (`RefreshInterceptor`) → `sessionController.setBanned()` → hiển thị BannedDialog

### 3. Luồng kill app / đóng tab → mở lại

```
User bị khóa (ban state đã persist vào storage)
        ↓
Kill app / đóng tab → mở lại
        ↓
AppSession.init()
  ├── (1) Kiểm tra persisted ban state → nếu có → setBanned + early return
  └── (2) getMe() → status === "BANNED" → setBanned + early return
        ↓
GoRouter: isLoggedIn = false → redirect LoginScreen
        ↓
LoginScreen phát hiện isBanned → hiển thị BannedDialog
        ↓
"Đã hiểu" → clearAll() (xóa ban state) → về màn Login bình thường
```

---

## III. Các file đã thay đổi / thêm mới

### Server

| File | Loại | Mô tả |
|------|------|-------|
| `server/src/modules/admin/service/admin.service.js` | Sửa | Emit socket `user:banned` tới room `user:${userId}` sau khi ban |
| `server/src/modules/auth/service/auth.service.js` | Sửa | Thêm `appealBan()` — lưu kháng cáo vào table `appeals`; fix table name từ `ban_appeals` → `appeals` |
| `server/src/modules/auth/controller/auth.controller.js` | Sửa | Thêm route handler `appealBan` |
| `server/src/modules/auth/routes/auth.route.js` | Sửa | Thêm route `POST /api/auth/appeal-ban` |
| `server/src/modules/user/repository/user.repository.js` | Sửa | `getUserAuthInfo` thêm `ban_reason`, `banned_at` vào SELECT |
| `server/script-db.sql` | Sửa | Thêm bảng `ban_appeals` (đã rename) |
| `migrations/001_add_ban_columns.sql` | Thêm | Thêm cột `ban_reason`, `banned_at`, `banned_by` vào table `users` |
| `migrations/002_create_appeals.sql` | Thêm | Tạo table `appeals` cho đơn kháng cáo |

### Web

| File | Loại | Mô tả |
|------|------|-------|
| `web/src/store/ban/banSlice.js` | Thêm | Redux slice: `setBanned`, `clearBanned` |
| `web/src/api/shared/AuthApi.js` | Sửa | 403 handler dispatch `setBanned`; thêm `appealBan()` API |
| `web/src/App.jsx` | Sửa | Subscribe socket `user:banned` + Redux `banState`; mount BannedNotification |
| `web/src/components/shared/BannedNotification/BannedNotification.jsx` | Thêm | Modal thông báo khóa + lý do + nút Kháng cáo + nút Đã hiểu |
| `web/src/socket/features/ban/banSocket.js` | Thêm | Listener socket `user:banned` → dispatch `setBanned` |

### Mobile

| File | Loại | Mô tả |
|------|------|-------|
| `mobile/lib/core/socket/socket_events.dart` | Sửa | Thêm hằng `userBanned = "user:banned"` |
| `mobile/lib/core/session/session_controller.dart` | Sửa | Thêm `isBanned`, `banReason`, `setBanned()`, `dismissBan()` — persist/clear storage |
| `mobile/lib/core/socket/modules/ban_socket.dart` | **Mới** | Module lắng nghe `user:banned` → `sessionController.setBanned()` |
| `mobile/lib/core/network/interceptor/refresh_interceptor.dart` | Sửa | 403 "đã bị khóa" → `clearAll()` + `sessionController.setBanned()` |
| `mobile/lib/core/di/di.dart` | Sửa | Đăng ký `BanSocket` singleton, inject vào `AppSession` |
| `mobile/lib/core/session/app_session.dart` | Sửa | Khởi động `banSocket.listenUserBanned()`; kiểm tra persisted ban state + `getMe()` status trước khi init |
| `mobile/lib/core/storage/storage_service.dart` | Sửa | Thêm `saveBanState()`, `getIsBanned()`, `getBanReason()`, `clearBanState()` |
| `mobile/lib/shared/widgtes/banned_dialog_widget.dart` | **Mới** | Dialog "Tài khoản đã bị khóa" + nút Kháng cáo (nhập lý do → gửi API) + Đã hiểu (logout) |
| `mobile/lib/routes/widgets/main_shell.dart` | Sửa | Listener ban state → hiển thị dialog khi `isBanned` |
| `mobile/lib/features/auth/models/user_model.dart` | Sửa | Thêm `banReason`, `bannedAt` fields; hỗ trợ cả camelCase và snake_case từ JSON |
| `mobile/lib/features/auth/data/auth_service.dart` | Sửa | Thêm `appealBan()` API call |
| `mobile/lib/features/auth/data/auth_repository.dart` | Sửa | Thêm `appealBan()` với try-catch |
| `mobile/lib/features/auth/presentation/screens/login_screen.dart` | Sửa | Thêm listener ban state; hiển thị ban dialog khi quay lại màn login |

---

## IV. Cơ chế 2 đường dẫn (Dual Path)

Tính năng sử dụng **2 đường dẫn độc lập** để đảm bảo không bỏ sót trạng thái ban:

| Đường dẫn | Trigger | Xử lý | Ưu điểm |
|-----------|---------|-------|---------|
| **Socket** (chính) | Server emit `user:banned` | BanSocket → setBanned() | Realtime, tức thời |
| **403 Interceptor** (dự phòng) | API call trả về 403 "đã bị khóa" | RefreshInterceptor → setBanned() | Fallback khi socket chậm/mất kết nối |

---

## V. Persist ban state (Chống kill-app)

Sau khi `setBanned()` được gọi (từ socket hoặc interceptor), trạng thái được persist vào `FlutterSecureStorage`:

```dart
// Key "is_banned" = "true"
// Key "ban_reason" = "Lý do khóa..."
```

Khi app khởi động lại:
1. `AppSession.init()` kiểm tra `getIsBanned()` → nếu true → setBanned + dừng init
2. Nếu không có persisted state → gọi `getMe()` → nếu `status === "BANNED"` → setBanned + dừng init
3. GoRouter redirect về LoginScreen (vì `isLoggedIn = false`)
4. LoginScreen phát hiện `isBanned` → hiển thị BannedDialog

Persist state chỉ được xóa khi:
- User nhấn "Đã hiểu" → `clearAll()` (xóa toàn bộ storage)
- Admin unbans user → user logout/login lại bình thường

---

## VI. Appeal (Kháng cáo)

User có thể gửi đơn kháng cáo từ dialog:

```
User nhấn "Kháng cáo"
        ↓
Dialog nhập lý do (textarea, max 500 ký tự)
        ↓
POST /api/auth/appeal-ban { reason: "..." }
        ↓
Server lưu vào table appeals (status = 'PENDING')
        ↓
Thông báo "Gửi yêu cầu kháng cáo thành công!"
        ↓
Tự động logout
```

Admin xem và xử lý đơn qua Web Admin:
- `GET /api/admin/appeals` — danh sách đơn
- `POST /api/admin/appeals/:id/approve` — duyệt
- `POST /api/admin/appeals/:id/reject` — từ chối

---

## VII. DB Schema

```sql
-- users table (thêm columns)
ALTER TABLE users ADD COLUMN ban_reason TEXT;
ALTER TABLE users ADD COLUMN banned_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN banned_by UUID REFERENCES users(user_id);

-- appeals table (kháng cáo)
CREATE TABLE appeals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id),
    reason TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    handled_by UUID REFERENCES users(user_id),
    handled_at TIMESTAMPTZ,
    admin_note TEXT
);
```

---

## VIII. Bug đã fix

### Bug 1: GoRouter redirect không thoát splash sau ban

**Nguyên nhân**: Trong `AppSession.init()`, các điểm kiểm tra ban state (`persisted ban` + `getMe() status`) gọi `controller.setBanned()` TRƯỚC khi set `_isInitialized = true`. Vì GoRouter redirect check `if (!_appSession.isInitialized) return splash`, nó reflux về splash vô hạn.

**Fix**: Đảo thứ tự — set `_isInitialized = true` TRƯỚC `controller.setBanned()`:

```dart
// Trước (sai)
controller.setBanned(reason: banReason);  // notifyListeners → GoRouter thấy isInitialized=false → splash
_isInitialized = true;
return;

// Sau (đúng) 
_isInitialized = true;
controller.setBanned(reason: banReason);  // notifyListeners → GoRouter thấy isInitialized=true → login
return;
```

Áp dụng cho cả 3 điểm trong `init()`:
- Persisted ban check
- `getMe()` BANNED check (main flow)
- `getMe()` BANNED check (retry flow)

### Bug 2: `handleRefreshToken` server không check BANNED

**Nguyên nhân**: Server cho phép banned user refresh token → lấy access token mới → gọi `getMe()` thành công → vào app.

**Fix**: Thêm check `user.status === "BANNED"` trong `handleRefreshToken` → trả về 403, mobile không thể refresh → `getValidAccessToken()` return null → redirect login.

---

## IX. Security considerations

1. **Chặn login khi bị ban**: `loginNormal` và `loginWithGoogle` kiểm tra `user.status === "BANNED"` → throw 403
2. **Chặn refresh token**: `handleRefreshToken` kiểm tra status qua `getUserAuthInfo`
3. **Appeal validation**: user chỉ được gửi kháng cáo khi `status === "BANNED"`
4. **Không hardcode credentials**: token, secrets đều qua env
5. **Ban state persist không thể bypass**: stored trong `FlutterSecureStorage` (mã hóa), chỉ xóa khi user chủ động logout

---

## X. Cập nhật bổ sung gần đây

### 1. Sửa lỗi `throwError` sai thứ tự tham số
- `appealBan` và `appealBanByEmail` trong `auth.service.js` gọi `throwError(404, "message")` thay vì `throwError("message", 404)`
- **Hậu quả**: HTTP status code bị gán bằng string → trả về 500 thay vì 404/400, client không phân biệt được lỗi
- **Fix**: Đảo thứ tự tham số cho đúng

### 2. Giới hạn số lần kháng cáo (tối đa 3 lần/user)
- Thêm check `SELECT COUNT(*) FROM ban_appeals WHERE user_id = $1` trước khi INSERT
- Nếu đã >= 3 appeal (bất kể status), trả về lỗi 400 và từ chối
- Áp dụng cho cả 2 endpoint: `appealBan` (có token) và `appealBanByEmail` (public)

### 3. Admin endpoints quản lý kháng cáo
| Endpoint | Mô tả |
|----------|-------|
| `GET /admin/appeals?page=&limit=&status=` | Danh sách kháng cáo (có filter theo status) |
| `POST /admin/appeals/:appealId/approve` | Duyệt kháng cáo → unban user + gửi email |
| `POST /admin/appeals/:appealId/reject` | Từ chối kháng cáo (có thể kèm lý do) |

- Dùng `transaction` để đảm bảo unban + update appeal status atomic
- Gửi email HTML thông báo tới user khi appeal được duyệt (dùng `transporter.sendMail`)

### 4. Email thông báo khi duyệt kháng cáo
- Nội dung email: thông báo tài khoản đã được mở khóa, user có thể đăng nhập lại
- Gửi đến email của user, dùng cùng template engine với OTP email

### 5. AuthInterceptor skip `/api/auth/appeal`
- Access token bỏ qua endpoint public `/api/auth/appeal`, tránh refresh token không cần thiết và giảm latency
