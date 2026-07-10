# Web Package Guidelines

Frontend web application built with React, Vite, and TailwindCSS.

## Commands
All commands must be executed in the `web/` directory:

| Task | Command | Description |
|------|---------|-------------|
| Install dependencies | `npm install` | Install npm packages |
| Dev server | `npm run dev` | Run Vite development server |
| Production build | `npm run build` | Build the project for production |
| Preview build | `npm run preview` | Locally preview the production build |
| Linting | `npm run lint` | Run ESLint check |

## Styling & Libraries
- **CSS Framework**: TailwindCSS v4 (using `@tailwindcss/vite` plugin).
- **State Management**: Redux Toolkit (`@reduxjs/toolkit` and `react-redux`).
- **Routing**: React Router v7 (`react-router-dom`).
- **Maps**: Leaflet and React Leaflet (`leaflet`, `react-leaflet`).

---

## 🏗️ Architecture & Directories (Quy định cấu trúc Code)
Để tiết kiệm Token khi tìm kiếm và ngăn ngừa lỗi kiến trúc, lập trình viên/AI phải tuân thủ nghiêm ngặt vị trí lưu trữ file như sau:

```
web/src/
├── api/          # 1. API Services (Quản lý gọi backend)
│   ├── admin/
│   └── shared/
├── components/   # 2. Reusable visual components (Component tái sử dụng)
├── layouts/      # 3. Layout wrappers (Giao diện khung)
├── pages/        # 4. Page views (Giao diện trang)
├── routes/       # 5. Route configurations (Cấu hình route/url)
├── store/        # 6. Redux state slices & configuration (Quản lý State)
└── utils/        # 7. Helper functions & common utilities
```

### 1. API Layer (`src/api/`)
- **Nhiệm vụ**: Chứa toàn bộ các hàm gọi API đến Backend.
- **Quy tắc**:
  - **BẮT BUỘC**: Mọi HTTP request (GET, POST, PUT, DELETE) gửi tới server phải được định nghĩa tại đây (Ví dụ: [AuthApi.js](file:///d:/workspace/do_an_tot_nghiep/web/src/api/shared/AuthApi.js)).
  - **Tuyên cấm**: Không khởi tạo trực tiếp instance `axios` hoặc viết request URL tùy tiện trực tiếp bên trong các React Component.
  - Sử dụng `axiosJWT` đối với các API cần token xác thực (tự động đính kèm `Authorization: Bearer <token>` và xử lý refresh token khi hết hạn).

### 2. Store Layer (`src/store/`)
- **Nhiệm vụ**: Định nghĩa các Redux slices quản lý Global State (Token, User Info, UI Settings...).
- **Quy tắc**:
  - Mỗi phần dữ liệu global cần có Slice riêng (ví dụ: `accessTokenSlice.js`).
  - Không lạm dụng Redux cho state cục bộ của component (hãy dùng `useState`).

### 3. Components (`src/components/`) vs Pages (`src/pages/`)
- **Components**: Chứa các thẻ, widget nhỏ, có tính tái sử dụng cao (Button, Input, MapContainer, Dialog...). Các file này không gắn trực tiếp với route cụ thể.
- **Pages**: Chứa giao diện trang hoàn chỉnh được điều hướng bởi Router (ví dụ: `LoginPage.jsx`, `DashboardPage.jsx`).

---

## ⚠️ Quy định nghiêm ngặt phòng ngừa lỗi (Error Prevention)
1. **Không import chéo sai Layer**: Các file trong `src/utils` hoặc `src/api` tuyệt đối không được import các React Component.
2. **Sử dụng Path Alias**: Luôn sử dụng alias `@/` đại diện cho thư mục `src/` (ví dụ: `import { store } from "@/store"` thay vì `import { store } from "../../store"`) để tránh lỗi sai đường dẫn tương đối khi di chuyển file.
3. **Quản lý Token**: Token truy cập phải được đọc và cập nhật thông qua Redux Store, không lưu trực tiếp hoặc thao tác thủ công trong UI component.
