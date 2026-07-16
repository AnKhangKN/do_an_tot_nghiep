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