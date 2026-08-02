# 🔀 Các Luồng Test Chính (Luồng đi)

Tài liệu mô tả từng **luồng test** theo đúng luồng hoạt động thực tế của hệ thống. Mỗi luồng ghi rõ:
**Điều kiện tiên quyết → Các bước → Kết quả mong đợi → Cách verify → Dọn dẹp**.

> Chú thích: `[R]` = cần xác thực (token), `[A]` = chỉ Admin, `[P]` = công khai.

---

## 1. Luồng Xác thực & Tài khoản

### 1.1 Đăng ký email + OTP
**Tiên quyết:** Email SMTP cấu hình trong `server/.env.*`; Redis đang chạy.

| Bước | Hành động | Endpoint / Sự kiện |
|------|-----------|---------------------|
| 1 | Đăng ký tài khoản `{ email, password, fullName }` | `POST /api/auth/register` |
| 2 | Hệ thống sinh OTP 6 số, TTL 10 phút trong Redis, gửi email | — |
| 3 | Nhập sai OTP | `POST /api/auth/verify-otp` → **400** |
| 4 | Nhập đúng OTP | → **200**, trả cặp `accessToken` + `refreshToken`, `is_verified = true` |
| 5 | Gửi lại OTP (khóa 60s chống spam) | `POST /api/auth/resend-otp` |

**Verify:** check email nhận được; check DB `users.is_verified`; check Redis key `otp:verify:{email}` bị xóa sau verify.
**Dọn dẹp:** xóa user test khỏi DB.

### 1.2 Đăng nhập / Refresh token
| Bước | Hành động | Kết quả mong đợi |
|------|-----------|------------------|
| 1 | `POST /api/auth/login` sai mật khẩu | **401** |
| 2 | Đăng nhập đúng | **200** kèm token |
| 3 | Gọi `GET /api/auth/me` với `Authorization: Bearer <access>` | **200**, trả user |
| 4 | Gọi `/api/auth/me` thiếu/sai token | **401** |
| 5 | Refresh token hết hạn | `POST /api/auth/refresh-token` → trả token mới |
| 6 | Logout | `DELETE /api/auth/logout` |

### 1.3 Đăng nhập Google
- Mobile bấm "Đăng nhập bằng Google" → lấy `idToken` → `POST /api/auth/google`.
- Server verify chữ ký qua `google-auth-library`. Token giả mạo → **401**.
- User chưa tồn tại → tự động tạo (`is_verified = true`, lưu `fullName`/`avatarUrl`).
- User bị ban → **403**.

### 1.4 Quên / Reset mật khẩu
`POST /api/auth/forgot-password` → gửi link/mã → `POST /api/auth/reset-password` → đăng nhập lại bằng mật khẩu mới.

### 1.5 Khóa tài khoản & Kháng cáo (Ban)
| Bước | Hành động | Endpoint |
|------|-----------|----------|
| 1 | Admin khóa user kèm lý do | `POST /api/admin/users/:userId/ban` `[A]` |
| 2 | Server emit socket `user:banned` tới room `user:{userId}` | — |
| 3 | Client (web/mobile) nhận ban → hiện dialog + logout | — |
| 4 | User gọi API → nhận **403 "Tài khoản đã bị khóa"** | fallback interceptor |
| 5 | User gửi kháng cáo (tối đa 3 lần) | `POST /api/auth/appeal-ban` `[R]` |
| 6 | Admin xem & xử lý | `GET /api/admin/appeals` `[A]`, `POST /api/admin/appeals/:id/approve|reject` `[A]` |
| 7 | Duyệt → unban + gửi email thông báo; user đăng nhập lại được | — |

**Verify đặc biệt:** kill app / đóng tab khi đang bị ban → mở lại vẫn bị chặn (ban state persist storage).

---

## 2. Luồng SOS Khẩn cấp (LUỒNG CỐT LÕI)

**Tài khoản cần:** 1 Victim, 1 Rescuer (đã online), 1 Admin.

```
Victim ──▶ Server ──▶ Admin Dashboard
   │  createSOS         sos:created (dashboard:event)
   ▼
Server ──▶ Worker (BullMQ): tìm rescuer gần nhất qua Redis Geo
             (2km → 5km → 10km → 20km, mỗi vòng 1 attempt)
   │
   ▼
Rescuer ◀── sos:offer (socket + FCM push)
   │
   ├─ accept → rescue:accepted (victim) + rescue:accept:success (rescuer) + SOS_ACCEPTED (admin)
   │
   └─ reject/timeout → offer cho rescuer khác
```

### 2.1 Tạo & tiếp nhận SOS (Happy path)
| Bước | Hành động | Kết quả mong đợi |
|------|-----------|------------------|
| 1 | Victim gọi `POST /api/sos/sos_requests` (kèm lat/lng, loại sự cố, ảnh) `[R]` | **201**, trạng thái `PENDING` |
| 2 | Admin dashboard nhận sự kiện realtime | socket `dashboard:event` |
| 3 | Rescuer online nhận `sos:offer` | hiện thông báo offer |
| 4 | Rescuer bấm tiếp nhận | socket `rescue:accept` |
| 5 | Victim nhận `rescue:accepted` (kèm thông tin rescuer) | SOS → `IN_PROGRESS` |
| 6 | Rescuer cập nhật vị trí | socket `rescuer:location:update` → Victim nhận `rescuer:location:updated` |
| 7 | Rescuer hoàn thành | socket `rescue:complete` → `rescue:completed` (2 bên) + `SOS_COMPLETED` (admin) |
| 8 | Victim điền check-in + đánh giá | `POST /api/sos/sos_requests/post-rescue-checkin` `[R]` + `POST /api/ratings` `[R]` |

### 2.2 Các nhánh rẽ bắt buộc test
| Nhánh | Cách test | Kết quả mong đợi |
|-------|-----------|------------------|
| **Hủy SOS** | Victim gọi `POST /api/sos/sos_requests/cancel` `[R]` | Rescuer nhận `sos:cancelled` |
| **Không tìm thấy rescuer** | Tắt hết rescuer online, tạo SOS | Victim nhận `sos:not_found` sau khi hết attempt |
| **SOS tự hủy 30 phút** | Tạo SOS, không ai nhận, chờ timer | Job BullMQ tự hủy; nạn nhân thấy thông báo lý do |
| **QR Fallback** | Tạo SOS khi mất mạng → quét QR `POST /api/sos/sos_requests/accept-qr` `[R]` | Nhận ca thành công, `viaQR` |
| **Chat đóng sau 15 phút** | Sau khi complete/cancel, chờ 15 phút | `chat:conversation_closed`; không gửi tin được nữa |

**Dọn dẹp:** hủy/xóa toàn bộ SOS test + conversation test.

---

## 3. Luồng Chat Realtime
- Tạo/đọc conversation: `POST /api/chat/conversations`, `GET /api/chat/conversations` `[R]`.
- Gửi tin: socket `chat:send_message` → mọi người trong room nhận `chat:new_message`.
- Support Admin: `POST /api/chat/conversations/admin-support` `[R]` → tin nhắn vào `admin_room`.
- Kiểm duyệt AI chặn từ cấm trong tin nhắn.
- **Test:** 2 client chat với nhau; 1 admin trả lời support; gửi tin chứa từ cấm → bị chặn + log AI Moderation.

---

## 4. Luồng Bản đồ & Dữ liệu không gian

### 4.1 Điểm nguy hiểm (Dangerous Points)
| Bước | Hành động | Endpoint |
|------|-----------|----------|
| 1 | User tạo điểm nguy hiểm `{lat, lng, dangerLevel, description}` | `POST /api/dangerous_points/` `[R]` |
| 2 | Auto-detect cluster (≥3 SOS trong 200m) gợi ý vùng mới | `POST /api/dangerous_points/admin/auto-detect` `[A]` |
| 3 | Admin duyệt / từ chối | `PUT /api/dangerous_points/admin/:id/approve|reject` `[A]` |
| 4 | Danh sách công khai chỉ chứa điểm đã duyệt | `GET /api/dangerous_points/approved` `[P]` |
| 5 | Cộng đồng xác minh (thật/giả/an toàn/nguy hiểm) | `POST /api/dangerous_points/:id/feedbacks` `[R]` |
| 6 | Admin xem feedback + kiểm duyệt | `GET /api/dangerous_points/admin/feedbacks` `[A]` |

### 4.2 Tiện ích khẩn cấp (Emergency Amenities)
- Danh mục: `GET /api/emergency-amenities/categories` `[P]` / `GET .../admin/categories` `[A]`.
- Tạo tiện ích: `POST /api/emergency-amenities/` `[R]` (kèm ảnh).
- Duyệt/khóa/xóa: `PUT /api/emergency-amenities/admin/points/:id/status`, `DELETE .../:id` `[A]`.
- Báo cáo vi phạm: `POST /api/emergency-amenities/:id/feedback` `[R]`.
- Gộp điểm trùng: `GET /api/emergency-amenities/admin/duplicates` + `POST /api/emergency-amenities/admin/merge` `[A]`.
- Danh sách công khai chỉ hiện điểm ACTIVE: `GET /api/emergency-amenities/approved` `[P]`.

### 4.3 Tìm kiếm địa điểm
- `GET /api/map/search?q=...&limit=...` `[R]` — Photon → fallback Nominatim, giới hạn 20 lần/phút/user.

**Test:** tạo điểm (bị chặn từ cấm?) → duyệt → check API public; gộp 2 điểm trùng; báo cáo vi phạm → admin xử lý.
**Dọn dẹp:** xóa điểm/category test.

---

## 5. Luồng AI Moderation
- Text chứa từ cấm (`blacklisted_phrases`) → bị chặn **0 token** (local).
- Text nghi ngờ → gọi Groq AI (Llama 3.3) kiểm duyệt (non-blocking).
- Log kiểm duyệt: `GET /api/ai-moderation/logs` `[A]`; duyệt/bác bỏ: `PATCH /api/ai-moderation/logs/:logId/review` `[A]`.
- **Test:** gửi tin nhắn/báo cáo chứa từ cấm; thêm từ cấm qua Settings → verify chặn ngay.

---

## 6. Luồng Admin Dashboard & Báo cáo
| Hành động | Endpoint |
|-----------|----------|
| Tổng quan dashboard (số liệu, trend, breakdown) | `GET /api/admin/dashboard/overview` `[A]` |
| Tóm tắt AI điều hành | `GET /api/admin/dashboard/ai-summary` `[A]` |
| Export CSV/Excel (UTF-8 BOM font Việt) | `GET /api/admin/dashboard/export-report` `[A]` |
| Heatmap điểm nóng (trọng số theo trạng thái) | `GET /api/admin/sos-heatmap` `[A]` |
| Quản lý rescuer | `GET /api/rescuer/rescuer`, `PATCH /api/rescuer/rescuer/verify` `[A]` |
| Cấu hình hệ thống (bán kính, hotline, thesis...) | `GET/PUT /api/admin/settings` `[A]`, `GET /api/public/settings/thesis-info` `[P]` |

**Test:** login admin → mở Dashboard (socket realtime cập nhật khi có SOS) → export report → mở file verify font tiếng Việt.

---

## 7. Luồng Rescuer
- Đăng ký hồ sơ rescuer: `POST /api/rescuer/register` `[R]`; avatar `PATCH /api/rescuer/avatar`.
- Online/offline: socket `rescuer:online` / `rescuer:offline` / `rescuer:heartbeat`.
- Admin duyệt rescuer: `PATCH /api/rescuer/rescuer/verify` `[A]`.
- Thống kê hiệu suất: `GET /api/rescuer/admin/analytics` `[A]`.
- **Test:** rescuer online → nhận SOS offer; offline → không nhận; heartbeat giữ online.

---

## 8. Luồng Thông báo & Thiết bị
- Đăng ký FCM device token: `POST /api/device_tokens/` `[R]`.
- Admin broadcast: `POST /api/notifications/broadcast` `[A]` (DB + FCM push).
- User xem/đánh dấu đã đọc: `GET /api/notifications/`, `PUT /api/notifications/read-all` `[R]`.

---

## 9. Luồng Đánh giá (Rating)
- Victim đánh giá sau ca: `POST /api/ratings` `[R]`.
- Xem theo SOS/rescuer: `GET /api/ratings/sos/:sosRequestId`, `GET /api/ratings/rescuer/:rescuerId` `[P]`.
- Admin thống kê + phân tích cảm xúc AI: `GET /api/ratings/admin`, `GET /api/ratings/admin/trends` `[A]`.

---

## 10. Luồng Landing Page & Thông tin đồ án (Web)
- `GET /api/public/settings/thesis-info` `[P]` trả thông tin tác giả, hotline, `app_apk_url`.
- **Test:** Admin điền thông tin ở Setting tab "Đồ án, Tác giả & Ứng dụng" → mở Landing page xem hiển thị đúng; để trống → fallback mặc định.
