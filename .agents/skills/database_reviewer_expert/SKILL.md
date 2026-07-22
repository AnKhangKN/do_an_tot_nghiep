---
name: database_reviewer_expert
description: Trigger khi: Thiết kế bảng CSDL mới, chỉnh sửa Model/Repository, tối ưu câu lệnh query SQL hoặc kiểm tra quan hệ database. Hướng dẫn AI tham chiếu script-db.sql, rà soát Index, Khóa ngoại, Transaction safety và Slow Queries.
---

# Thẩm Định Cơ Sở Dữ Liệu (Database Reviewer) ⭐⭐⭐⭐⭐

Kỹ năng này bắt buộc AI phải luôn tham chiếu tệp [script-db.sql](../../../../script-db.sql) và thẩm định tối ưu hiệu năng CSDL PostgreSQL / Redis trong hệ thống.

---

## 🔍 Checklist Thẩm Định CSDL (Database Review Checklist)

### 1. Tham chiếu Schema gốc (`script-db.sql`)
- Mọi câu lệnh SQL trong Repository phải tuân thủ chuẩn kiểu dữ liệu (UUID, DOUBLE PRECISION, VARCHAR), tên cột và bảng khai báo trong [script-db.sql](../../../../script-db.sql).

### 2. Tối ưu Chỉ mục (Missing Index Check)
- Đảm bảo các cột hay nằm trong mệnh đề `WHERE`, `JOIN`, `ORDER BY` hoặc các khóa ngoại (Foreign Keys) đều đã được đánh Index thích hợp (b-tree, GiST / SP-GiST cho tọa độ địa lý).

### 3. An Toàn Giao Dịch (Transaction Safety)
- Khi thực hiện các thao tác ghi/sửa trên nhiều bảng dữ liệu liên quan (ví dụ: Tạo SOS + Ghi Log Lịch sử + Cập nhật trạng thái), bắt buộc phải bọc trong một `transaction(async (client) => { ... })` để đảm bảo tính toàn vẹn dữ liệu (ACID).

### 4. Tối ưu Câu lệnh Query (Slow Query Optimization)
- Bắt buộc dùng `LIMIT` và `OFFSET` (Phân trang) đối với các câu lệnh `SELECT` danh sách.
- Tránh câu lệnh `SELECT *` không cần thiết khi chỉ cần một vài trường cụ thể.
- Sử dụng Redis Cache cho các dữ liệu ít thay đổi hoặc tần suất đọc cực cao (vị trí Rescuer, session, active rescues).
