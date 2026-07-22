---
name: security_reviewer_expert
description: Trigger khi: Viết API mới, xử lý Auth, chỉnh sửa Query SQL, xử lý Token/Password hoặc rà soát an ninh bảo mật. Hướng dẫn AI kiểm tra và ngăn chặn các lỗ hổng SQL Injection, XSS, CSRF, JWT, Auth/Role Bypass, Secret Leakage.
---

# Thẩm Định An Ninh & Bảo Mật Hệ Thống (Security Reviewer) ⭐⭐⭐⭐⭐

Kỹ năng này bắt buộc AI phải luôn thẩm định và áp dụng các tiêu chuẩn an toàn thông tin tối đa khi phát triển ứng dụng web, API và mobile.

---

## 🛡️ Checklist Thẩm Định Bảo Mật (Security Review Checklist)

Mỗi khi viết API mới, xử lý truy vấn dữ liệu hoặc làm việc với tài khoản người dùng, AI phải rà soát 7 tiêu chuẩn bảo mật sau:

### 1. Phòng chống SQL Injection (Chống truy vấn độc hại)
- **Parameterized Queries**: Bắt buộc dùng tham số truyền `$1, $2, $3` trong tất cả các câu lệnh Postgres SQL.
- ❌ **Cấm tuyệt đối**: Cộng chuỗi SQL trực tiếp từ tham số người dùng (ví dụ: `WHERE email = '` + email + `'`).

### 2. Xác thực & Phân quyền (Authentication & Authorization - RBAC)
- **Kiểm tra JWT Token**: Đảm bảo tất cả các API riêng tư đều đi qua middleware xác thực JWT (`verifyToken`).
- **Phân quyền theo Role**: Kiểm tra kỹ vai trò (`VICTIM`, `RESCUER`, `ADMIN`). Ngăn chặn rò rỉ quyền hạn (Privilege Escalation) hoặc lấy dữ liệu của user khác (IDOR).

### 3. Kiểm tra Dữ liệu Đầu vào (Input Validation & Sanitization)
- Validate toàn bộ dữ liệu từ `req.body`, `req.params`, `req.query` tại tầng Validator trước khi đưa vào Controller/Service.
- Ép đúng kiểu dữ liệu (UUID, Integer, Email format, Coordinate lat/lng).

### 4. Quản lý Secret & Chống Rò Rỉ Thông Tin (Secret Management & Anti-Leak)
- Không hardcode API Keys, DB Passwords, JWT Secret Key trong file mã nguồn. Tất cả phải nằm trong `.env`.
- ❌ **Nghiêm cấm log nhạy cảm**: Không bao giờ `console.log` hoặc ghi vết `password`, `token`, `OTP`, số thẻ hoặc thông tin cá nhân PII ra file log.

### 5. Phòng chống XSS (Cross-Site Scripting) & CSRF
- Sanitize HTML/Text trước khi render trên giao diện Web React và Mobile Flutter.
- Cấu hình CORS chặt chẽ, chỉ cho phép các Domain/Origin được chỉ định. Sử dụng `helmet` để bảo vệ HTTP headers.

### 6. Mã hóa Mật khẩu & Token (Password Hashing)
- Sử dụng `bcrypt` (hoặc Argon2) với salt rounds an toàn (tối thiểu 10) để mã hóa mật khẩu. Tuyệt đối không lưu plain text password trong CSDL.

---

## 📝 Báo cáo Thẩm định Bảo mật
Khi được yêu cầu review an ninh hoặc viết các API quan trọng, AI báo cáo ngắn gọn:
1. **SQL Injection Check**: Đã tham số hóa query.
2. **Auth & Role Check**: Đã kiểm tra JWT và phân quyền Middleware.
3. **Input Validation**: Đã validate tại tầng Validator.
4. **Secret / Log Leak Check**: Không lộ secret key hay thông tin nhạy cảm.
