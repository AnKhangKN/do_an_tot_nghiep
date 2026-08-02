# 🛠️ Phương Pháp Test

Các phương pháp được dùng theo từng tình huống. **Nguyên tắc chung: phương pháp "tạm" (script verify) chỉ để xác nhận, sau khi chạy phải xóa và dọn sạch dữ liệu.**

---

## 1. Smoke Test Tự Động (giữ trong repo)

Chạy nhanh mỗi khi thay đổi code, xác nhận hệ thống "không vỡ".

| Package | Lệnh | Kiểm tra |
|---------|------|----------|
| `server/` | `npm run test:smoke` | App boot được, router `/api` mount, route public ≠ 404, route lạ → 404, route cần token → 401 |
| `web/` | `npm run test:smoke` | `npm run lint` + `npm run build` PASS |
| `mobile/` | `flutter test` | App smoke test chạy qua |

> ⚠️ Server smoke test không cần DB/Redis đang chạy. Nếu DB/Redis chưa bật, log lỗi kết nối sẽ xuất hiện nhưng test vẫn PASS.

---

## 2. Script Verify Tạm (tạo → chạy → XÓA)

Dùng khi cần test một luồng cụ thể hoặc verify bug fix. **Đây là phương pháp chính cho `server/` và `web/` vì chưa có framework unit test.**

### 2.1 Quy trình
1. Tạo script trong `server/test/` (hoặc `web/test/`) với tên `temp_*.js`.
2. Chạy bằng `node test/temp_xxx.js` (trong `server/` / `web/`).
3. Kiểm tra kết quả → **XÓA NGAY file** (dù PASS hay FAIL).
4. Dọn sạch dữ liệu test khỏi DB.

### 2.2 Template script gọi API (server, Node 18+ có sẵn `fetch`)

```js
// server/test/temp_verify.js  ← tạo tạm, chạy xong XÓA
require("module-alias/register");

const BASE = "http://localhost:8080/api"; // đổi theo PORT trong .env.development

async function main() {
  // 1. Đăng nhập lấy token (platform MOBILE để nhận refreshToken)
  const login = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "test_user@example.com", password: "matkhau123", platform: "MOBILE" }),
  });
  const { accessToken } = (await login.json()).data || {};
  console.log("login status:", login.status);

  // 2. Gọi API cần verify
  const res = await fetch(`${BASE}/users`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  console.log("GET /users status:", res.status, await res.text());

  // 3. Dọn dẹp: xóa dữ liệu test trong DB nếu đã tạo
}

main().catch((e) => { console.error("FAIL:", e.message); process.exit(1); });
```

### 2.3 Template script query DB trực tiếp (verify dữ liệu)

```js
// server/test/temp_db.js  ← tạo tạm, chạy xong XÓA
require("module-alias/register");
const { pool } = require("@/config/database.config");

(async () => {
  const { rows } = await pool.query(
    "SELECT user_id, email, status, is_verified FROM users WHERE email LIKE 'test_%' LIMIT 5"
  );
  console.log(rows);
  await pool.end();
  // Dọn dẹp: DELETE FROM users WHERE email LIKE 'test_%' ...
})().catch((e) => { console.error(e); process.exit(1); });
```

> 📌 **Lưu ý:** tên dữ liệu test phải thuần (`"Test Category"`, `"test_user@example.com"`), không gắn UUID vào tên. Chạy xong phải xóa khỏi DB.

---

## 3. Test Theo Tầng (Server)

| Tầng | Test cái gì | Cách |
|------|-------------|------|
| **Validator** | Nhận/thiếu param sai | Gọi API thiếu field → expect 400 |
| **Controller + Service** | Business logic, luồng chính | Script gọi API thật (mục 2) |
| **Repository** | SQL, mapping field | Script query DB (mục 2.3) |
| **Middleware** | Auth/ban/role | Gọi API thiếu token (401), role sai (403), user bị ban (403) |
| **Worker / BullMQ** | Matching, tự hủy SOS | Tạo SOS thật, quan sát log worker + socket |
| **Socket** | Sự kiện realtime | Xem mục 4 |

---

## 4. Test Socket Realtime (server)

Cần `server/` đang chạy (`npm run dev:all`) + Redis. Dùng `socket.io-client` (đã có trong `server/node_modules`) trong script tạm:

```js
// server/test/temp_socket.js  ← tạo tạm, chạy xong XÓA
const { io } = require("socket.io-client");

const socket = io("http://localhost:8080", {
  auth: { token: "<access_token>" }, // token của Rescuer
});

socket.on("connect", () => console.log("connected:", socket.id));
socket.on("sos:offer", (data) => console.log("NHẬN SOS OFFER:", data));
socket.emit("rescuer:online");

setTimeout(() => process.exit(0), 15000);
```

Kết hợp với script tạo SOS (mục 2.2) để test luồng offer → accept → complete.

---

## 5. Test Web (Admin UI)

Hiện chưa có framework unit test cho `web/`. Phương pháp:

1. **Lint + Build**: `npm run test:smoke` (luôn chạy sau khi sửa code web).
2. **Test tay (manual)**: `npm run dev`, đăng nhập Admin, đi theo từng luồng trong [FLOWS.md](./FLOWS.md):
   - Dashboard realtime: mở 2 tab (Admin + tạo SOS từ mobile/server) → số liệu + toast cập nhật.
   - Map: bật/tắt từng layer (Heatmap / Điểm nguy hiểm / Vùng nguy hiểm / Tiện ích / Cứu hộ).
   - AI Moderation: check log + Duyệt/Bác bỏ.
   - Ban/Appeal: khóa user → user logout ngay → xử lý đơn kháng cáo.
   - Settings: đổi bán kính/hotline → verify áp dụng ngay không cần restart.
3. **Script tạm**: nếu cần verify logic phức tạp (vd: format dữ liệu), tạo script Node chạy tạm rồi xóa.

---

## 6. Test Mobile (Flutter)

`mobile/` có `flutter_test` — test giữ trong repo. Phương pháp:

1. **Unit test model**: kiểm tra `fromJson`/`toJson` của các model (dữ liệu mẫu tĩnh, không cần mạng).
2. **Widget test**: smoke test hiện tại.
3. **Integration test (tay)**: `flutter run` trên thiết bị/emulator, chạy luồng:
   - Đăng ký → OTP → vào app.
   - Bấm giữ SOS → nhận offer → nhận ca → chat → hoàn thành → check-in + rating.
   - Offline: mất mạng → queue tin nhắn/vị trí → có mạng lại → sync.
   - Ban: bị khóa giữa chừng → dialog + logout.
   - Geofencing: vào vùng nguy hiểm → cảnh báo âm thanh/rung.

---

## 7. Kiểm Tra An Ninh (bắt buộc khi sửa auth/ban)

- [ ] API nhạy cảm phải có `verifyToken` (+ `isAdmin`/`isRescuer`/`isNotBanned` khi cần).
- [ ] Thiếu token → **401**; role sai → **403**; user bị ban → **403**.
- [ ] Refresh token của user bị ban → **403**.
- [ ] Không log password/token/PII.
- [ ] Input được validate ở server (không tin client).

---

## 8. Checklist Trước Khi Kết Thúc Task

- [ ] Chạy `npm run test:smoke` (server) → PASS.
- [ ] Chạy `npm run test:smoke` (web) → lint + build PASS.
- [ ] Nếu sửa mobile: `flutter analyze` + `flutter test` → sạch lỗi.
- [ ] Xóa toàn bộ file test tạm đã tạo.
- [ ] Dọn sạch dữ liệu test trong DB (không còn user/category/sos test).
- [ ] Không commit `.env`, secrets, credentials.
