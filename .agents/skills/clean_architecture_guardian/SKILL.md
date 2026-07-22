---
name: clean_architecture_guardian
description: Trigger khi: Viết code mới, refactor mã nguồn, kiểm tra chất lượng code hoặc thiết kế kiến trúc. Hướng dẫn AI kiểm tra và đảm bảo mã nguồn tuân thủ các nguyên tắc SOLID, DRY, KISS, Separation of Concerns, Dependency Injection và không vi phạm phân tầng (Layer Violation).
---

# Vệ sĩ Kiến trúc & Chất lượng Mã nguồn (Clean Architecture Guardian) ⭐⭐⭐⭐⭐

Kỹ năng này bắt buộc AI phải luôn thẩm định chất lượng mã nguồn, phát hiện và đề xuất giải pháp khắc phục các vi phạm về kiến trúc phần mềm trong quá trình lập trình.

---

## 🔍 Danh mục Kiểm tra Quy chuẩn (Architecture Checklist)

Khi viết hoặc chỉnh sửa bất kỳ đoạn code nào, AI phải chủ động kiểm tra các tiêu chuẩn sau:

### 1. Nguyên tắc SOLID
- **Single Responsibility (SRP)**: Mỗi file, class, module hoặc function chỉ chịu trách nhiệm về một tác vụ duy nhất.
- **Open/Closed (OCP)**: Code dễ mở rộng nhưng hạn chế sửa đổi trực tiếp các thành phần cốt lõi đã chạy ổn định.
- **Dependency Inversion (DIP)**: Các module cấp cao không phụ thuộc trực tiếp vào module cấp thấp. Sử dụng Dependency Injection (`getIt`, Constructor Injection) để giảm bám dính (coupling).

### 2. Nguyên tắc DRY & KISS
- **DRY (Don't Repeat Yourself)**: Không viết lặp lại các đoạn logic giống nhau. Gom nhóm các tiện ích dùng chung vào `shared/`, `utils/` hoặc `helpers/`.
- **KISS (Keep It Simple, Stupid)**: Giữ giải pháp đơn giản, rõ ràng, không over-engineer hoặc viết mã phức tạp vô ích.

### 3. Phân tách Trách nhiệm (Separation of Concerns)
- **Giao diện (UI/Presentation)**: Chỉ đảm nhận hiển thị và bắt sự kiện người dùng. Không chứa logic xử lý API hay truy vấn dữ liệu.
- **Quản lý Trạng thái (State Management - BLoC/Provider/Redux)**: Quản lý luồng trạng thái UI và kết nối với Service.
- **Tầng Nghiệp vụ (Service Layer)**: Chứa toàn bộ logic nghiệp vụ thực sự của ứng dụng.
- **Tầng Dữ liệu (Repository/Model)**: Quản lý truy vấn Database (PostgreSQL/Redis) hoặc REST API/Socket.

### 4. Bắt lỗi Vi phạm Phân tầng (Layer Violation Detection)
- ❌ **Server**: Cấm viết SQL trong Controller hoặc Service. Cấm gọi chéo Repository/Controller của module khác (Services bắt buộc giao tiếp qua Service của module kia).
- ❌ **Mobile**: Cấm gọi trực tiếp `Dio` / `Http` trong Screen Widget. Cấm import chéo từ `features/` vào `core/`.

---

## 🛠️ Quy trình xử lý khi phát hiện Vi phạm
Nếu đoạn code hiện tại hoặc đoạn code dự định viết vi phạm bất kỳ tiêu chuẩn nào ở trên, AI bắt buộc phải:
1. **Giải thích nguyên nhân**: Nêu rõ đoạn code vi phạm nguyên tắc nào (ví dụ: Vi phạm SRP, Layer Violation,...).
2. **Đề xuất phương án tối ưu**: Đưa ra cấu trúc code lại chuẩn chỉnh (Propose a better implementation) và áp dụng giải pháp sạch nhất.
