---
name: project_development_assistance
description: Helps the AI developer in this monorepo project to minimize token usage, respect the layered architecture, write high-quality mobile UI code, defer database changes, and communicate in Vietnamese.
---

# Hướng dẫn phát triển dự án tối ưu Token & Đúng định hướng

Tài liệu này đóng vai trò như một kỹ năng (Skill) tự động kích hoạt để hướng dẫn các AI developer làm việc trên dự án monorepo này một cách hiệu quả nhất.

## 1. Tiết kiệm Token tối đa (Token Optimization)
- **Đọc file thông minh**: Chỉ sử dụng `read_file` cho các dải dòng cụ thể cần chỉnh sửa (sử dụng `start_line` và `end_line`). Không đọc cả file nếu không cần thiết.
- **Tìm kiếm chính xác**: Sử dụng `search_files` để định vị hàm, class hoặc biến thay vì đọc bừa bãi.
- **Viết code tối thiểu**: Khi thay đổi code, chỉ thay thế đúng đoạn code cần thiết thông qua `replace_in_file` hoặc `write_to_file` khi thật sự cần tạo mới. Tránh ghi đè toàn bộ file nếu không cần.

## 2. Ngôn ngữ giao tiếp & Ghi chú
- **Luôn phản hồi bằng tiếng Việt** đối với mọi câu hỏi của người dùng, ngoại trừ khi có yêu cầu hoặc ghi chú cụ thể bằng tiếng Anh.
- **Ghi chú trong Code (Comments)**: Ưu tiên viết ghi chú/comment mới bằng **Tiếng Việt**. Chỉ viết bằng Tiếng Anh khi được yêu cầu. Giữ nguyên toàn bộ các ghi chú Tiếng Anh có sẵn do người dùng tự viết trước đó, không được chỉnh sửa hay xóa bỏ chúng.


## 3. Kiến trúc dự án
- **Server**: Cấu trúc Layered Modular. Không gọi SQL ở Controller hay Service. Luôn viết SQL trong Repository. Khi các module khác nhau cần liên hệ/giao tiếp với nhau, các Service bắt buộc phải gọi thông qua Service của module kia. Tuyệt đối không gọi chéo qua Controller hoặc Repository của module khác.
- **Mobile (Flutter)**: Feature-First Clean Architecture.
- **Web**: React, Redux Toolkit, React Router v7, Tailwind CSS v4.

## 4. Quy định Phát triển UI & Mobile (Flutter)
- **Công cụ phát triển**: Người dùng code chủ yếu trên Android Studio. Không được chạy các lệnh làm xung đột gradle lock hoặc lock file với Android Studio.
- **Tạo UI chất lượng cao**:
  - Viết UI responsive, hỗ trợ đa màn hình.
  - Tách widget nhỏ gọn, dễ tái sử dụng tại `shared/` hoặc `widgets/` của feature.
  - Sử dụng Bloc/Cubit để quản lý state và xử lý logic UI. Không lạm dụng `setState` hay viết logic gọi API trong file Widget.

## 5. Quy tắc làm việc với Cơ sở dữ liệu & Repository
- **Thao tác dữ liệu qua luồng API**: Mọi thay đổi dữ liệu (thêm/sửa/xóa) phải được lập trình chạy theo đúng luồng API chuẩn (Route -> Validator -> Controller -> Service -> Repository), tuyệt đối không thực thi các câu lệnh SQL trực tiếp trên database của người dùng để can thiệp dữ liệu thủ công.
- **Không thực thi các câu lệnh phá hủy**: Nghiêm cấm chạy các câu lệnh thay đổi cấu trúc bảng (DROP, ALTER,...) trực tiếp trên database của khách hàng để đảm bảo an toàn tuyệt đối cho hệ thống dữ liệu.

