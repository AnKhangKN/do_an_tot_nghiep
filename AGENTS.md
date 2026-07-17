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

## Security

- Không log password, token, PII
- Validate input ở server
- Không hardcode API keys