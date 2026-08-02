# 📋 Hướng dẫn Test — Hệ thống Cứu hộ Khẩn cấp Thời gian thực

Tài liệu tổng hợp **cách test toàn bộ dự án** (monorepo `server/` + `web/` + `mobile/`): các luồng test chính ("luồng đi") và phương pháp test cho từng nền tảng.

- Chi tiết luồng test: xem [FLOWS.md](./FLOWS.md)
- Chi tiết phương pháp test: xem [METHODS.md](./METHODS.md)

---

## 1. Kiến trúc & Vai trò của các tầng khi test

```
Mobile App (Flutter)  ──┐
Web Admin (React)     ──┼──▶ API server (Express) ──▶ PostgreSQL
                        │       │                        Redis (Geo, cache, OTP, queue)
                        └── Socket.IO (realtime)
```

| Tầng | Trách nhiệm | Cách test |
|------|--------------|-----------|
| `server/` | Logic nghiệp vụ, auth, SOS, matching, AI, báo cáo | Smoke test + script tạm gọi API/DB thật |
| `web/` | Web Admin, Landing page | `lint` + `build` + test tay UI |
| `mobile/` | App Victim & Rescuer | `flutter test` + test tay (real device) |

---

## 2. Lệnh chạy test nhanh

| Mục đích | Lệnh | Directory |
|----------|------|-----------|
| Smoke test Server (boot + route + middleware) | `npm run test:smoke` | `server/` |
| Smoke test Web (lint + build) | `npm run test:smoke` | `web/` |
| Test Mobile (flutter_test) | `flutter test` | `mobile/` |
| Lint Web | `npm run lint` | `web/` |
| Chạy Server để test API/socket | `npm run dev:all` | `server/` |
| Chạy Web để test UI | `npm run dev` | `web/` |
| Chạy Mobile trên thiết bị | `flutter run` | `mobile/` |

> ⚠️ Test luồng cần **PostgreSQL + Redis + Worker** đang chạy. Khởi động nhanh bằng `docker-compose.development.yml` ở gốc repo (nếu dùng Docker) hoặc chạy `npm run dev:all` trong `server/`.

---

## 3. Cấu trúc thư mục test

```
do_an_tot_nghiep/
├── test/                      ← Thư mục test ở GỐC (tài liệu này)
│   ├── README.md              ← Tổng quan
│   ├── FLOWS.md               ← Các luồng test chính (luồng đi)
│   └── METHODS.md             ← Phương pháp test từng nền tảng
├── server/test/smoke.test.js  ← Smoke test Server (Node test runner)
├── web/test/smoke.test.js     ← Smoke test Web (lint + build)
└── mobile/test/widget_test.dart ← Smoke test Mobile (flutter_test)
```

---

## 4. Quy tắc test BẮT BUỘC (theo `AGENTS.md`)

1. **Tên dữ liệu test phải thuần** — vd: `"Test Category"`, `"Test User"`. KHÔNG gắn id/UUID vào tên.
2. **Test xong phải dọn sạch DB** — không để lại dữ liệu test trong hệ thống.
3. **File test tạm (để verify) phải XÓA NGAY sau khi chạy** — kể cả PASS hay FAIL, kể cả file ở ngoài repo.
4. **Chỉ giữ lại test trong repo khi dự án có framework chính thức**:
   - `server/`: Node built-in test runner (`node:test`) — dùng cho smoke test.
   - `web/`: chưa có framework unit test — dùng lint/build + script tạm.
   - `mobile/`: `flutter_test` — test được giữ trong repo.
5. **Mọi bug fix nên có test** nếu package đã có framework test.
6. Không log password, token, PII khi chạy test.
