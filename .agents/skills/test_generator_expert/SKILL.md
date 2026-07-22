---
name: test_generator_expert
description: Trigger khi: Được yêu cầu viết unit test, integration test, kiểm thử luồng biên (Edge cases) hoặc kiểm tra tính đúng đắn của hàm/API. Hướng dẫn AI tạo các bộ test hoàn chỉnh và LƯU TRỮ VÀO THƯ MỤC TEST RIÊNG BIỆT.
---

# Chuyên Gia Viết Test Bào Phủ (Test Generator) ⭐⭐⭐⭐⭐

Kỹ năng này hướng dẫn AI thiết kế các bộ kiểm thử tự động (Unit Test, Integration Test) bao phủ đầy đủ luồng chính (Happy Path), trường hợp biên (Edge Cases) và xử lý ngoại lệ (Negative Tests).

---

## 📁 QUY ĐỊNH BẮT BUỘC VỀ THƯ MỤC LƯU TEST
- **Tất cả các tệp Test bắt buộc phải nằm trong thư mục TEST RIÊNG BIỆT của từng package, tuyệt đối KHÔNG lưu chung trong thư mục code nghiệp vụ (`src/` hoặc `lib/`)**:
  - 🖥️ **Server (Node.js)**: Lưu tại `server/tests/unit/` hoặc `server/tests/integration/` (ví dụ: `server/tests/unit/sos.service.test.js`).
  - 📱 **Mobile (Flutter)**: Lưu tại `mobile/test/` (ví dụ: `mobile/test/features/victim/victim_provider_test.dart`).
  - 🌐 **Web (React)**: Lưu tại `web/tests/` hoặc `web/src/__tests__/`.

---

## 🧪 Các Kịch Bản Test Cần Bao Phủ (Test Scenarios)

### 1. Luồng Chuẩn (Happy Path)
- Kiểm tra hàm/API hoạt động thành công đúng như kỳ vọng với dữ liệu đầu vào chuẩn.

### 2. Trường hợp Biên (Edge Cases)
- Kiểm tra mảng rỗng `[]`, chuỗi rỗng `""`, `null`, `undefined`, giá trị cực đại/cực tiểu (Min/Max coordinates, Max length string).

### 3. Kiểm thử Ngoại lệ & Dữ liệu Không Hợp lệ (Negative & Exception Tests)
- Truyền sai định dạng UUID, sai số điện thoại, token không hợp lệ, giả định mất mạng / timeout CSDL.
- Kiểm tra xem hàm/API có ném ra lỗi (Throw Error) hoặc trả về mã HTTP thích hợp (400, 401, 404, 500) hay không.
