# Server Package Guidelines

ExpressJS backend API with background worker processing.

## Commands
Run all commands in `server/`:

| Task | Command |
|------|---------|
| Install dependencies | `npm install` |
| Dev (API only) | `npm run dev` |
| Dev (Worker only) | `npm run dev:worker` |
| Dev (All) | `npm run dev:all` |
| Start (API only) | `npm start` |
| Start (Worker only) | `npm run worker` |

## Authentication
- JWT Bearer Authentication
- Header: `Authorization: Bearer <token>`
- Verify in `src/middlewares/auth.middleware.js` with `ACCESS_TOKEN`
- Decoded user ID is attached to `req.userId`

## Modular Architecture
Mọi tính năng mới phải nằm trong `src/modules/<module_name>/` theo đúng layer:

1. `routes/` — tạo router, gắn middleware, đăng ký vào `routes/index.js`
2. `validator/` — validate input trước khi vào controller
3. `controller/` — nhận request, gọi service, trả response
4. `service/` — xử lý business logic, gọi repository
5. `repository/` — chứa toàn bộ SQL query
6. `model/` — map table/field của database

## Rules by Layer
- Model: không viết SQL
- Repository: toàn bộ SELECT/INSERT/UPDATE/DELETE phải ở đây; dùng `client` hoặc `pool` từ `@config/database.config`
- Service: không query DB trực tiếp; dùng `transaction(async (client) => { ... })` khi ghi nhiều bảng/dòng
- Controller: không chứa business logic hoặc SQL; chỉ lấy dữ liệu từ `req.body`, `req.query`, `req.params`
- Routes: gắn middleware cần thiết như `verifyToken`

## Error Prevention
- Không import chéo repository giữa các module
- Module khác phải gọi qua service
- Dùng alias `@/config`, `@modules`, `@utils`, `@middlewares`, `@socket`