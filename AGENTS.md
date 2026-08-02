# Project Overview

Phiên bản:
- nodejs: 22.22.3

Monorepo gồm:
- `web/` — Web app (React-Vite)
- `server/` — Backend API (Expressjs)
- `mobile/` — Mobile app (Flutter)

Đọc thêm `AGENTS.md` của từng package trước khi sửa code ở đó.

## Commands

| Task | Command | Directory |
|------|---------|-----------|
| Install dependencies (server) | `npm install` | `server/` |
| Install dependencies (web) | `npm install` | `web/` |
| Install dependencies (mobile) | `flutter pub get` | `mobile/` |
| Dev frontend | `npm run dev` | `web/` |
| Dev server (API + Worker) | `npm run dev:all` | `server/` |
| Dev server (API only) | `npm run dev` | `server/` |
| Dev mobile | `flutter run` | `mobile/` |
| Lint frontend | `npm run lint` | `web/` |
| Smoke test server | `npm run test:smoke` | `server/` |
| Smoke test web | `npm run test:smoke` | `web/` |
| Run mobile tests | `flutter test` | `mobile/` |

## Git & PR

- Branch: `feature/`, `fix/`, `chore/`
- Commit: `feat:`, `fix:`, `chore:`, `refactor:` (Conventional Commits)
- Không commit `.env`, secrets, credentials
- PR nhỏ, mô tả rõ phạm vi thay đổi

## Code chung

- Ngôn ngữ: JavaScript (web, server), Dart (mobile)
- Tên biến, hàm, file, database & models: viết bằng tiếng Anh rõ nghĩa
- Message/Error trả về client: viết bằng tiếng Việt
- Không over-engineer; sửa đúng phạm vi task
- Không thêm dependency mới nếu không cần
- Không sửa file ngoài phạm vi trừ khi bắt buộc

## Architecture

- Frontend gọi API qua `server/` — không gọi DB trực tiếp
- `packages/shared/` không tồn tại
- Auth: JWT / session — xem `server/AGENTS.md`

## Testing

- Mọi bug fix nên có test nếu package đó đã có test
- Chạy test của package liên quan trước khi xong task
- File test dùng để kiểm tra/verify: **sau khi chạy xong (PASS hay FAIL) phải XÓA NGAY file test đó** (kể cả file test tạm ở ngoài repo), tránh tạo quá nhiều file rác làm nặng máy và nặng dự án
- Quy tắc này áp dụng cho MỌI file tạo ra để test, kể cả khi truy cập hệ thống (DB, server, script chạy test...): tạo file test xong → chạy → xóa ngay, không để lại file/dữ liệu test trong hệ thống
- Tên dữ liệu test (category, user, amenity...) phải là tên thuần (vd: "Test Category") KHÔNG được gắn thêm id/UUID vào tên; nếu cần phân biệt thì dùng dấu hiệu khác, và test xong phải dọn sạch khỏi DB
- Chỉ giữ lại test trong repo nếu dự án đã có framework/chuẩn test chính thức (Jest/Vitest/...)

## Security

- Không log password, token, PII
- Validate input ở server
- Không hardcode API keys