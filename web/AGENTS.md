# Web Package Guidelines

Frontend web app built with React, Vite, TailwindCSS.

## Commands
Run all commands in `web/`:

| Task | Command |
|------|---------|
| Install dependencies | `npm install` |
| Dev server | `npm run dev` |
| Production build | `npm run build` |
| Preview build | `npm run preview` |
| Lint | `npm run lint` |
| Smoke test | `npm run test:smoke` |

## Stack
- CSS: TailwindCSS v4 (`@tailwindcss/vite`)
- State: Redux Toolkit (`@reduxjs/toolkit`, `react-redux`)
- Routing: React Router v7 (`react-router-dom`)
- Maps: Leaflet / React Leaflet (`leaflet`, `react-leaflet`)

## UI/UX Rules
- Primary/active: `bg-gray-900`, hover `bg-gray-800`, text white
- Surfaces/input: `bg-gray-50`, borders `border-gray-200`
- Text: `text-gray-900`, `text-gray-700`, `text-gray-600`, `text-gray-500`
- Radius: `rounded-2xl` cho button/input/item/nav, `rounded-3xl` cho card/form, `rounded-xl` cho icon wrapper
- Shadow: `shadow-sm` cho sidebar/panels, `shadow-md` cho card, `shadow-lg` cho active nav
- Icon: chỉ dùng Phosphor Icons (`react-icons/pi`)

## Architecture
`web/src/`
- `api/` — mọi HTTP request đến backend
  - Không gọi axios trực tiếp trong component
  - Dùng `axiosJWT` cho API cần token
- `store/` — global state (token, user info, UI settings)
  - Mỗi dữ liệu global nên có slice riêng
  - State cục bộ dùng `useState`
- `components/` — component tái sử dụng
- `pages/` — page theo route

## Error Prevention
- `src/utils` và `src/api` không import React component
- Luôn dùng alias `@/` thay cho path tương đối sâu
- Token phải đọc/cập nhật qua Redux Store

## Components chuẩn hóa bảng + modal
Khi xây trang quản trị dùng `TableComponent` có **xem chi tiết / thêm / sửa / xóa**, bắt buộc dùng 2 component chung sau (KHÔNG tự viết modal inline):

### `components/admin/TableComponent/CellDetailComponent/CellDetailComponent.jsx`
Drawer chi tiết **bên phải, full `h-screen`**, body scroll, nút hành động ở footer. Props chính:
- `open`, `onClose`, `title`, `subtitle`
- `columns`, `row`, `rowIndex`, `imageUrl`, `extraFields` — body mặc định (loop cột + ảnh + trường phụ)
- `children` — thay body mặc định khi cần layout riêng (vd: split 2 cột ảnh + grid info)
- `actions` — mảng nút footer: `{ key, label, icon, variant: 'primary'|'success'|'danger'|'warning'|'ghost', position: 'left', hidden, loading, disabled, onClick }`
- `closeLabel` (default `Đóng`)

Dùng qua `TableComponent` với prop passthrough `detailActions` / `detailTitle` / `detailSubtitle`, hoặc render trực tiếp trong trang.

### `components/admin/AddUpdateModelComponent/AddUpdateModelComponent.jsx`
Modal **trung tâm** (`inset-0`), `max-h-screen` + body `overflow-y-auto`, luôn có nút Hủy + Lưu. Props chính:
- `open`, `onClose`, `title`, `subtitle`, `headerIcon` (node)
- `children` — nội dung form (KHÔNG bọc `<form>`; component tự bao form và submit)
- `onSubmit` (submit handler), `submitLabel` (default `Lưu`), `submitVariant` ('primary'|'success'|'danger'), `submitDisabled`
- `loading` — chặn đóng modal khi đang xử lý
- `cancelLabel`, `maxWidth` (default `max-w-md`)

### Quy tắc
- Modal xem chi tiết (read-only, có nút thao tác) → `CellDetailComponent`
- Modal thêm/sửa (form + nút lưu) → `AddUpdateModelComponent`
- Không tạo thêm wrapper/modal tương tự mới; tái sử dụng 2 component trên