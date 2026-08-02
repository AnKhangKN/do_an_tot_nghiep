# Project Review — Hệ thống Cứu hộ Khẩn cấp Thời gian thực

Tài liệu ghi nhận các vấn đề phát hiện và đề xuất cải thiện trong quá trình phát triển. Được cập nhật liên tục.

---

## 📄 `web/src/pages/admin/MapPage/MapPage.jsx`

**Ngày review**: 2026-08-01 — **Trạng thái: ✅ Đã xử lý xong** (cập nhật 2026-08-01)

### 🚨 Vấn đề nghiêm trọng

#### 1. Dữ liệu giả (Hard-coded Mock Data)
- ✅ **Đã xử lý**: Xóa toàn bộ mock data cứng. MapPage giờ fetch dữ liệu thật khi mount:
  - `getSosHeatmap()` → `GET /api/admin/sos-heatmap`
  - `getApprovedDangerousZones()` → `GET /api/dangerous_points/approved`
  - `getApprovedAmenitiesPublic()` → `GET /api/emergency-amenities/approved`
  - `getRescuersAdmin()` → `GET /api/rescuer/rescuer`

#### 2. Layer "Điểm nguy hiểm" và "Vùng nguy hiểm"
- ✅ **Đã xử lý**: Cả 2 layer đều render từ API thật `dangerPoints`:
  - `DangerLayer` — Marker (điểm), icon theo `danger_level` (HIGH → fire, còn lại → accident).
  - `DangerZoneLayer` — Circle (vùng bán kính), radius & màu theo `danger_level` (HIGH: 400m đỏ, MEDIUM: 250m cam, LOW: 150m vàng) vì bảng `dangerous_points` không có cột `radius`.

---

### ⚠️ Vấn đề cần cải thiện

#### 3. Layer "Khu sửa xe" → Tiện ích khẩn cấp
- ✅ **Đã xử lý**: Xóa layer "Khu sửa xe" / `RepairLayer` / `PiWrenchFill`. Thay bằng layer **"Tiện ích khẩn cấp"** (`AmenityLayer`) fetch từ API thực, marker divIcon chữ thập đỏ tự vẽ (không phụ thuộc URL ngoài), popup hiển thị `categoryName` (phân loại theo type) + `name` + `phone`.

#### 4. `Math.random()` làm key React
- ✅ **Đã xử lý**: Thay bằng key ổn định `${lat}_${lon}` (hoặc `osm_id` khi có).

---

### 💡 Đề xuất bổ sung tính năng

#### 5. Thêm bộ lọc trạng thái SOS
- ⏳ Chưa thực hiện (đề xuất optional).

#### 6. Mở rộng panel thống kê
- ✅ **Đã xử lý**: Thêm "Điểm nguy hiểm đã duyệt" và "Tiện ích khẩn cấp" vào thẻ thống kê dưới bản đồ.

#### 7. Layer gom nhóm theo loại
- ✅ **Đã xử lý**: Mỗi nhóm dữ liệu là 1 `LayersControl.Overlay` độc lập (Heatmap / SOS / Điểm nguy hiểm / Vùng nguy hiểm / Tiện ích khẩn cấp / Cứu hộ). Bật layer nào hiển thị toàn bộ dữ liệu của nhóm đó.

---

---

## 🚀 `web/src/pages/StartPage/StartPage.jsx` — Tái cấu trúc thành Trang giới thiệu ứng dụng (Landing Page)

**Ngày đề xuất**: 2026-08-01 — **Trạng thái: ✅ Đã xử lý xong** (cập nhật 2026-08-01)

### 🎯 Mục tiêu
Chuyển đổi `StartPage` từ trang điều hướng đơn giản thành **Trang giới thiệu tổng quan (Landing Page)** hiện đại, ấn tượng cho Hệ thống Cứu hộ Khẩn cấp Thời gian thực. Trang này đóng vai trò giới thiệu toàn bộ hệ sinh thái (Mobile App cho người dân/cứu hộ viên + Web Admin cho trung tâm điều phối).

---

### 🎨 Cấu trúc các khối nội dung (Page Sections)

#### 1. Hero Section (Khối ấn tượng đầu trang)
* **Headline mạnh mẽ**: "Hệ thống Cứu hộ Khẩn cấp Thời gian thực & Định vị Cảnh báo Nhanh chóng".
* **Sub-headline**: "Kết nối tức thì người cần trợ giúp với đội ngũ cứu hộ và trung tâm điều phối chuyên nghiệp."
* **Badge**: "Đồ án tốt nghiệp" + thông tin trường / Giảng viên hướng dẫn (đọc từ API public, fallback khi rỗng).
* **Hành động chính (CTA)**: 🔴 **Tải ứng dụng Mobile** — link APK do Admin cấu hình (`app_apk_url`), hiển thị disabled khi chưa có link.
* **Visual**: Mockup giao diện ứng dụng Mobile (Flutter) — CSS thuần, không dùng ảnh ngoài, responsive `w-[220px] → lg:290px`.
* **Lưu ý**: KHÔNG hiển thị bất kỳ lối vào admin trên landing page (đã gỡ "Đăng nhập Trung tâm Điều phối").

#### 2. Live Statistics Highlights (Thống kê nổi bật)
* Hiển thị các chỉ số ấn tượng theo phong cách Minimalist:
  * 🚑 **99.9%** — Thời gian tiếp nhận tín hiệu tức thì (Realtime WebSockets).
  * 📍 **24/7** — Cảnh báo vùng nguy hiểm & sự cố thời gian thực.
  * 🏥 **100+** — Tiện ích khẩn cấp (Bệnh viện, Trạm cứu hỏa, Đội hỗ trợ) tích hợp.

#### 3. Key Features Grid (Tính năng cốt lõi của Hệ thống)
Thiết kế Card dạng `rounded-3xl` với Phosphor Icons (`react-icons/pi`) — 3 tính năng (grid `lg:grid-cols-3`):
* 🆘 **Tín hiệu SOS Khẩn cấp**: Định vị GPS chính xác, gửi yêu cầu cứu hộ tức thì kèm hình ảnh/mô tả sự cố.
* ⚠️ **Bản đồ Cảnh báo Vùng nguy hiểm**: Theo dõi các điểm ngập lụt, sạt lở, tai nạn giao thông được duyệt chính thức.
* 🗺️ **Tra cứu Tiện ích Khẩn cấp (Emergency Amenities)**: Tìm kiếm vị trí bệnh viện, trạm cứu thương, cây xăng, dịch vụ cứu hộ gần nhất.
> Đã gỡ card "Điều phối Thông minh" (mô tả admin chưa có tính năng phân công nhân sự/quản lý dữ liệu) — chỉ giới thiệu những gì hệ thống thực sự có.

#### 4. Quy trình Cứu hộ 3 Bước (How It Works)
Visual step-by-step đơn giản:
1. **Bước 1 — Phát tín hiệu**: Người dân phát SOS hoặc báo cáo sự cố qua Mobile App.
2. **Bước 2 — Tiếp nhận & Điều phối**: Hệ thống đẩy thông báo realtime tới Cứu hộ viên gần nhất & Trung tâm Admin.
3. **Bước 3 — Trợ giúp Kịp thời**: Cứu hộ viên tiếp cận vị trí qua chỉ đường bản đồ & hoàn thành cứu hộ.

#### 5. Ecosystem Showcase (Hệ sinh thái Đa nền tảng)
* **Mobile App (Flutter)**: Dành cho Người dân & Đội cứu hộ lưu động (Realtime Push Notification, GPS Tracking). Kèm nút tải APK (hoặc thông báo "Link chưa có" khi Admin chưa cấu hình).
* **Web Admin (ReactJS & Tailwind)**: Dành cho Ban quản lý & Trung tâm tiếp nhận thông tin khẩn cấp — chỉ giới thiệu vai trò, KHÔNG có link/nút truy cập.

#### 6. Footer & Khối Liên hệ Khẩn cấp
* Phím tắt quay số khẩn cấp nhanh: **115** (Cấp cứu), **114** (Chữa cháy & Cứu nạn), **113** (Cảnh sát).
* Thông tin đồ án tốt nghiệp (trường, tác giả + MSSV/lớp, GVHD) và liên hệ (email/sđt) — do Admin quản lý, fallback khi rỗng.
* Bản quyền thuộc tác giả đồ án; không có link vào khu vực quản trị.

#### 7. Fullpage Scroll-Snap & Hiệu ứng lướt mượt
* 9 section, mỗi section `min-h-dvh snap-start` (desktop tắt CSS snap `lg:snap-none`, mobile giữ `snap-proximity`).
* Desktop: wheel handler tự viết — **gom cử chỉ lăn → dừng 120ms → trượt đúng 1 section** bằng `requestAnimationFrame` + `easeInOutCubic` (700–1200ms). Lăn mạnh/nhẹ cũng chỉ 1 section; lăn tiếp trong lúc đang trượt sẽ queue 1 hướng chờ, không cộng dồn.
* Section nào cao hơn màn hình → nhả scroll native bên trong section đó.
* Component `Reveal`: fade-up khi vào màn hình (`IntersectionObserver`, `prefers-reduced-motion` respect).
* Nút tròn đỏ trở về section đầu (góc phải dưới) hiện khi đã cuộn qua nửa màn hình, trượt mượt về đầu.

---

### 💄 Chuẩn UX/UI & Code Rules áp dụng
* **Tone màu**: Sử dụng bảng màu Minimalist & Sleek (`bg-gray-900`, `text-white`, `border-gray-200`, `bg-gray-50`).
* **Bo góc & Shadow**: `rounded-2xl` cho Button/Input, `rounded-3xl` cho Card tính năng lớn.
* **Icons**: Đồng bộ 100% bằng Phosphor Icons (`react-icons/pi`).
* **Responsive**: Tương thích hoàn hảo từ giao diện Mobile Web đến Màn hình máy tính Desktop lớn.

### ✅ Triển khai thực tế (2026-08-01)

**Web — Landing Page** (`web/src/pages/StartPage/`)
- Viết lại `StartPage.jsx` assemble 9 section, fetch dữ liệu động qua `api/public/PublicApi.js` (`getPublicThesisInfo`); thêm fullpage scroll handler (wheel → 1 section), `Reveal` fade-up và nút trở về đầu.
- `components/` (convention `...Component.jsx`): `HeroSectionComponent` (badge "Đồ án tốt nghiệp", mockup CSS thuần không dùng ảnh ngoài, CTA tải APK), `StatsSectionComponent`, `FeaturesSectionComponent` (3 tính năng), `HowItWorksSectionComponent`, `TechStackSectionComponent`, `ArchitectureSectionComponent`, `EcosystemSectionComponent`, `DocumentationSectionComponent`, `FooterSectionComponent`, `Reveal`.
- **Đã gỡ toàn bộ lối vào admin**: bỏ CTA "Đăng nhập Trung tâm Điều phối" (Hero), "Truy cập Web Admin" (Ecosystem), link "Trung tâm điều phối" (Footer); bỏ card "Điều phối Thông minh" vì admin chưa có tính năng tương ứng.

**Backend — Thông tin đồ án do Admin quản lý** (`server/src/modules/settings/`)
- Thêm group `thesis` vào `DEFAULT_SETTINGS`: tác giả (tên/MSSV/lớp/trường/GVHD), link GitHub, link báo cáo PDF, email/sđt liên hệ, `app_apk_url` (link tải APK ngoài).
- Validator cho phép `thesis_*` và `app_apk_url` lưu rỗng.
- Service `getPublicThesis()` trả về nhóm thesis + `app_apk_url` + hotline (115/114/113/112).
- Route public mới `GET /api/public/settings/thesis-info` (`settings.public.route.js`).

**Web Admin** (`web/src/pages/admin/SettingPage/SettingPage.jsx`)
- Thêm tab **"5. Đồ án, Tác giả & Ứng dụng"** (icon `PiStudentFill`) quản lý thông tin trên; landing page đọc qua API công khai (fallback khi dữ liệu rỗng).

**Verify**: `npm run lint` ✅, `npm run build` ✅ (web); script test tạm chạy OK trên DB thật rồi xóa ngay ✅.

---

## 📱 Single Active Session (kick thiết bị cũ) — Đã hoàn thành cả 3 nền tảng

**Ngày ghi nhận**: 2026-08-03 — **Trạng thái: ✅ Hoàn thành (Server + Mobile + Web Admin)**

### Bối cảnh
Đã triển khai tính năng "single active session" cho **Server + Mobile + Web Admin**:
- Mỗi thiết bị có `deviceId` gửi qua `socket.auth.deviceId`.
- Server giữ `active_session:{userId}` (Redis, TTL 24h) trong `server/src/socket/session.socket.js`.
- Khi thiết bị khác đăng nhập cùng tài khoản: ADMIN luôn kick thiết bị cũ (`user:kicked`); RESCUER/VICTIM đang trong ca cứu hộ → chặn thiết bị mới (`session:blocked`, không đụng thiết bị cũ); rảnh → kick thiết bị cũ.
- Mobile: `lib/core/socket/modules/session_socket.dart` lắng nghe `user:kicked` / `session:blocked` → `KickedDialogWidget` (nút "Đã hiểu") → tự logout về Login. LoginScreen hiện dialog.
- Web Admin: `web/src/socket/core/socketCore.js` sinh/lưu `deviceId` (localStorage, `crypto.randomUUID()`) gửi qua `auth` callback; `web/src/socket/features/session/sessionSocket.js` lắng nghe `user:kicked`; `web/src/App.jsx` subscribe `subscribeKickedEvent` → `KickedNotification` (nút "Đã hiểu") + auto logout (`logout` + `clearUser` + `disconnectAdminSocket` + navigate `/admin/login`).

### Ghi chú
- Admin không có khái niệm ca cứu hộ → server không chặn `session:blocked` cho ADMIN (luôn kick).
- Test tay Web: 2 cửa sổ/browser admin khác nhau, đăng nhập cùng tài khoản → cửa sổ cũ bị kick về login kèm `KickedNotification`.


