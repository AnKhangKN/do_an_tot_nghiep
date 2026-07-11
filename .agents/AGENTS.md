# Project-Scoped Rules (Quy tắc Dự án do_an_tot_nghiep)

Dưới đây là các quy tắc nghiêm ngặt mà AI phải tuân thủ khi làm việc trên dự án này để tiết kiệm tài nguyên (Token), tránh đi lệch hướng và đảm bảo chất lượng code.

---

## 1. Ngôn ngữ Giao tiếp (Communication Language)
* **Bắt buộc**: Luôn luôn trả lời bằng **Tiếng Việt** chuẩn, rõ ràng, dễ hiểu khi tương tác với người dùng.
* **Ngoại lệ**: Chỉ phản hồi bằng Tiếng Anh khi người dùng yêu cầu rõ ràng bằng văn bản (ví dụ: "Please reply in English").
* **Mã nguồn**: Tên biến, hàm, file, database & models vẫn bắt buộc viết bằng **Tiếng Anh**. Các câu báo lỗi (Error messages) hoặc thông báo hiển thị cho người dùng cuối (Toasts, Dialogs) viết bằng **Tiếng Việt**.
* **Ghi chú trong Code (Comments)**: Khi tự động viết ghi chú/comment trong mã nguồn, bắt buộc viết bằng **Tiếng Việt**. Chỉ viết bằng Tiếng Anh khi được yêu cầu rõ ràng. Đối với các ghi chú bằng Tiếng Anh có sẵn do người dùng tự viết từ trước, **tuyệt đối không được tự ý sửa đổi hoặc xóa chúng**.


---

## 2. Quy định Tiết kiệm Token & Tránh đi lệch hướng
* **Tối ưu hóa tìm kiếm**:
  - Không sử dụng các lệnh đọc đệ quy hoặc liệt kê file quá rộng nếu không thực sự cần thiết.
  - Sử dụng `grep_search` với các từ khóa cụ thể để định vị file nhanh chóng thay vì duyệt qua toàn bộ thư mục.
* **Tối ưu hóa đọc file**:
  - Không đọc toàn bộ file nếu file quá lớn. Sử dụng `view_file` với tham số `StartLine` và `EndLine` để chỉ xem phần code cần thiết.
* **Tối ưu hóa ghi file**:
  - Chỉ dùng `replace_file_content` hoặc `multi_replace_file_content` cho các thay đổi cụ thể, tránh việc viết lại toàn bộ file hoặc sử dụng các chunk thay thế quá lớn làm tốn token.
* **Tuân thủ Kiến trúc**:
  - **Server (Expressjs)**: Kiến trúc Layered Modular: `routes` -> `validator` -> `controller` -> `service` -> `repository` -> `model` -> `database`. Không viết SQL ngoài `repository`. Không import chéo repo. **Quy định liên hệ**: Khi các module cần giao tiếp với nhau, các Service bắt buộc phải gọi trực tiếp thông qua Service của module kia. Tuyệt đối không được gọi chéo qua Controller hoặc Repository của module khác để giữ tính độc lập và phân tách trách nhiệm.
  - **Mobile (Flutter)**: Kiến trúc Feature-First Clean Architecture: `models`, `data`, `presentation` (UI và Bloc/Cubit). Không import chéo từ `features` vào `core`.
  - **Web (React/Vite)**: Quản lý API tập trung ở `src/api/`, Global State dùng Redux Toolkit tại `src/store/`. Tách biệt rõ `components` (tái sử dụng) và `pages` (giao diện route).

---

## 3. Quy định Thiết kế UI & Phát triển ứng dụng Mobile (Flutter)
* **Môi trường phát triển**:
  - Dự án mobile được viết bằng Flutter tại thư mục `mobile/`.
  - Người dùng chủ yếu làm việc trên **Android Studio** để code và build app, tuy nhiên thư mục code vẫn đồng bộ với workspace này.
  - AI không nên chạy các lệnh build Gradle nặng hoặc chạy `flutter run` gây khóa tài nguyên hoặc xung đột với Android Studio đang chạy. Hãy để Android Studio tự quản lý Hot Reload/Build, AI chỉ cần tập trung viết code `.dart` chất lượng.
* **Thiết kế & Tạo UI Tốt (UI Guidelines)**:
  - Giao diện phải hiện đại, trực quan, hỗ trợ Responsive tốt cho nhiều kích thước màn hình (sử dụng `MediaQuery`, `LayoutBuilder` hoặc thư viện như `flutter_screenutil` nếu có sẵn).
  - Tách các Widget giao diện thành các Component nhỏ, dễ tái sử dụng và đặt trong `shared/` hoặc thư mục con `widgets/` của feature.
  - **Bắt buộc**: Tách biệt UI và Logic. Sử dụng **Bloc** hoặc **Cubit** để quản lý trạng thái UI. Tuyệt đối không lạm dụng `setState` hoặc viết logic xử lý API/nghiệp vụ trực tiếp bên trong giao diện Widget.

---

## 4. Quy định làm việc với Cơ sở dữ liệu & Repository (Database Rules)
* **Tuân thủ Script Database**: Khi tạo hoặc cập nhật các Model và Repository, AI bắt buộc phải tham chiếu và tuân thủ chính xác cấu trúc bảng, kiểu dữ liệu (UUID, DOUBLE PRECISION,...), quan hệ khóa ngoại và các Index đã được khai báo tại file [script-db.sql](file:///d:/workspace/do_an_tot_nghiep/script-db.sql) để đảm bảo đồng bộ hệ thống.
* **Chỉ thao tác dữ liệu thông qua API**: Khi thực hiện các nghiệp vụ thay đổi dữ liệu (ví dụ: tạo người dùng mới, cập nhật trạng thái, xóa tài khoản,...), bắt buộc phải lập trình viết mã nguồn chạy theo đúng luồng API chuẩn của hệ thống (Route -> Validator -> Controller -> Service -> Repository).
* **Cấm can thiệp trực tiếp vào DB**:
  - Tuyệt đối **KHÔNG** chạy trực tiếp các câu lệnh query (INSERT, UPDATE, DELETE) thủ công trên database để thay đổi dữ liệu, nhằm ngăn ngừa nguy cơ sai lệch dữ liệu và mất tính nhất quán.
  - Tuyệt đối **KHÔNG** chạy các câu lệnh phá hủy (DROP TABLE, ALTER, DROP COLUMN,...) trực tiếp trên database thực tế làm hỏng cấu trúc hệ thống.

