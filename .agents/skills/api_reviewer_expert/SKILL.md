---
name: api_reviewer_expert
description: Trigger khi: Thiết kế hoặc chỉnh sửa RESTful API, Controller, Route. Hướng dẫn AI kiểm tra chuẩn REST, HTTP Status Codes, Đặt tên Route, Validation và Định dạng Response chuẩn.
---

# Thẩm Định Chuẩn RESTful API (API Reviewer) ⭐⭐⭐⭐⭐

Kỹ năng này hướng dẫn AI thẩm định và thiết kế toàn bộ hệ thống REST API theo đúng chuẩn RESTful, có cấu trúc phản hồi nhất quán và mã trạng thái HTTP chuẩn xác.

---

## 🔍 Checklist Thẩm Định API (API Review Checklist)

### 1. Quy Chuẩn Đặt Tên Route (REST Naming Conventions)
- Sử dụng danh từ số nhiều cho các Resource: `/api/sos/sos_requests`, `/api/users`, `/api/notifications`.
- Sử dụng đúng HTTP Methods:
  - `GET`: Lấy danh sách hoặc chi tiết tài nguyên.
  - `POST`: Tạo mới tài nguyên.
  - `PUT` / `PATCH`: Cập nhật tài nguyên.
  - `DELETE`: Xóa tài nguyên.

### 2. Mã Trạng Thái HTTP (HTTP Status Codes)
- `200 OK`: Thành công (Lấy dữ liệu, Cập nhật, Xóa).
- `201 Created`: Tạo mới tài nguyên thành công.
- `400 Bad Request`: Lỗi dữ liệu đầu vào không hợp lệ (Validation Error).
- `401 Unauthorized`: Chưa đăng nhập hoặc Token hết hạn/không hợp lệ.
- `403 Forbidden`: Không có quyền truy cập vào tài nguyên này.
- `404 Not Found`: Không tìm thấy tài nguyên.
- `500 Internal Server Error`: Lỗi hệ thống server.

### 3. Định Dạng Phản Hồi Nhất Quán (Response Format Standard)
Mọi API trả về bắt buộc theo cấu trúc chuẩn:
```json
{
  "success": true,
  "message": "Thông báo ngắn gọn bằng tiếng Việt",
  "data": { ... },
  "pagination": { "page": 1, "limit": 10, "total": 100, "totalPages": 10 }
}
```

### 4. Bắt Buộc Phân Trang (Pagination)
- Tất cả API trả về danh sách đều phải hỗ trợ tham số `page` và `limit` để giới hạn số lượng bản ghi.
