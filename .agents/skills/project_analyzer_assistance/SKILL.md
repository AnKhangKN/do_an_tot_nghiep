---
name: project_analyzer_assistance
description: Trigger khi: Nhận tác vụ mới trên module chưa quen thuộc, cần refactor hệ thống lớn, hoặc khi người dùng yêu cầu phân tích project. Hướng dẫn AI hiểu toàn bộ kiến trúc, luồng dữ liệu, entry point và sơ đồ phụ thuộc trước khi sửa code.
---

# Quy trình Phân tích Dự án trước khi Sửa Code (Project Analyzer) ⭐⭐⭐⭐⭐

Kỹ năng này bắt buộc AI phải hiểu rõ toàn bộ cấu trúc dự án và luồng xử lý dữ liệu trước khi thực hiện bất kỳ thay đổi mã nguồn nào.

---

## ⛔ Quy tắc Vàng: Không sửa code khi chưa hoàn thành phân tích
- **Never edit code before finishing analysis**: Tuyệt đối KHÔNG chỉnh sửa hoặc ghi đè code khi chưa hiểu rõ ảnh hưởng của thay đổi đó lên các module khác trong hệ thống.

---

## 📋 Các bước Phân tích Dự án (Analysis Steps)

### 1. Đọc Cấu trúc Thư mục & Framework
- Đọc các file cấu hình dependency chính (`package.json`, `pubspec.yaml`).
- Xác định rõ các thành phần của Monorepo:
  - Backend API: `server/` (Node.js, Express.js, Redis, BullMQ, PostgreSQL).
  - Mobile App: `mobile/` (Flutter, Clean Architecture, Provider/Bloc).
  - Web App: `web/` (React, Vite, Redux Toolkit, Tailwind CSS).

### 2. Tìm các điểm khởi chạy (Entry Points)
- Tìm và xác định điểm bắt đầu của từng package:
  - Server Entry Points: `server/src/server.js`, `server/src/app.js`, `server/src/workers/`.
  - Mobile Entry Point: `mobile/lib/main.dart`, `mobile/lib/core/session/app_session.dart`.
  - Web Entry Point: `web/src/main.jsx`, `web/src/App.jsx`.

### 3. Truy vết Luồng xử lý dữ liệu (Request & Data Flow)
- Xác định luồng di chuyển của dữ liệu từ Client đến Server và Database:
  - Luồng HTTP API: `Route` $\rightarrow$ `Validator` $\rightarrow$ `Controller` $\rightarrow$ `Service` $\rightarrow$ `Repository` $\rightarrow$ `Database`.
  - Luồng Realtime Socket: `Client Event` $\rightarrow$ `Socket Handler` $\rightarrow$ `Service / Redis PubSub` $\rightarrow$ `Socket Emitter` $\rightarrow$ `Client Listener`.

### 4. Liệt kê các Module chính & Sơ đồ Phụ thuộc (Dependency Graph)
- Xác định rõ mối quan hệ phụ thuộc giữa các module (Auth, SOS, Rescuer, Location, Matching, Notification, Chat).
- Kiểm tra các quy tắc kiến trúc (ví dụ: Service chỉ gọi Service, không import chéo Repository).

---

## 📝 Báo cáo Kết quả Phân tích
Khi được yêu cầu phân tích hoặc làm việc trên module lớn, AI trình bày tóm tắt kết quả phân tích theo cấu trúc:
1. **Kiến trúc & Framework chính**
2. **Entry Points & Module liên quan**
3. **Luồng dữ liệu (Data Flow)**
4. **Các lưu ý an toàn trước khi chỉnh sửa**
