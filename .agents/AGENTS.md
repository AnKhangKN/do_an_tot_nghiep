# Project-Scoped Rules (Quy tắc Dự án do_an_tot_nghiep)

Dưới đây là các quy tắc nghiêm ngặt mà AI phải tuân thủ khi làm việc trên dự án này để tiết kiệm tài nguyên (Token), tránh đi lệch hướng và đảm bảo chất lượng code.

---

## 0. Quy định Kích hoạt Skill Thông minh (Smart On-Demand Skill Triggering)
* **Khởi tạo Session**: Mỗi khi bắt đầu một phiên làm việc mới, AI chủ động tham chiếu các quy tắc trong tệp `.agents/AGENTS.md` này.
* **Đọc Skill theo nhu cầu (Lazy Loading)**: AI KHÔNG đọc tất cả các Skill cùng lúc để tiết kiệm Token. AI chỉ mở tệp `SKILL.md` của đúng skill liên quan khi tác vụ của người dùng khớp với phạm vi của skill đó, và ưu tiên chỉ đọc các đoạn cần thiết.
  - Khi sửa lỗi, debug, gặp bug hay xem log → Đọc tệp [debug_logging_assistance](./skills/debug_logging_assistance/SKILL.md).
  - Khi viết code UI Flutter, làm việc với Express.js API, React Web hay chỉnh sửa DB → Đọc tệp [project_development_assistance](./skills/project_development_assistance/SKILL.md).
  - Khi yêu cầu mơ hồ, thiếu thông tin log, hoặc cần xác nhận thiết kế → Đọc tệp [strict_clarification_assistance](./skills/strict_clarification_assistance/SKILL.md).
  - Khi cần phân tích kiến trúc dự án, luồng dữ liệu, hoặc refactor lớn → Đọc tệp [project_analyzer_assistance](./skills/project_analyzer_assistance/SKILL.md).
  - Khi viết code mới, refactor, kiểm tra SOLID/DRY/KISS hay vi phạm phân tầng → Đọc tệp [clean_architecture_guardian](./skills/clean_architecture_guardian/SKILL.md).
  - Khi sửa bug phức tạp, truy vết nguyên nhân sự cố → Đọc tệp [bug_hunter_expert](./skills/bug_hunter_expert/SKILL.md).
  - Khi hoàn thành tính năng, rà soát trùng lặp hay tối ưu lại code → Đọc tệp [refactoring_expert](./skills/refactoring_expert/SKILL.md).
  - Khi xử lý API Auth, Query SQL, Token/Password hoặc rà soát an ninh → Đọc tệp [security_reviewer_expert](./skills/security_reviewer_expert/SKILL.md).
  - Khi thiết kế CSDL, chỉnh sửa Model/Repository hoặc tối ưu query SQL → Đọc tệp [database_reviewer_expert](./skills/database_reviewer_expert/SKILL.md).
  - Khi thiết kế API, Controller, Route hoặc định dạng Response → Đọc tệp [api_reviewer_expert](./skills/api_reviewer_expert/SKILL.md).
  - Khi sinh tài liệu kỹ thuật, API docs, sơ đồ Mermaid → Đọc tệp [documentation_writer_expert](./skills/documentation_writer_expert/SKILL.md).
  - Khi tạo Unit Test, Integration Test → Đọc tệp [test_generator_expert](./skills/test_generator_expert/SKILL.md).

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

## 3. Quy định Thiết kế UI & Phát triển (Mobile & Web Admin)
* **Môi trường phát triển Mobile (Flutter)**:
  - Dự án mobile được viết bằng Flutter tại thư mục `mobile/`.
  - Người dùng chủ yếu làm việc trên **Android Studio** để code và build app, tuy nhiên thư mục code vẫn đồng bộ với workspace này.
  - AI không nên chạy các lệnh build Gradle nặng hoặc chạy `flutter run` gây khóa tài nguyên hoặc xung đột với Android Studio đang chạy. Hãy để Android Studio tự quản lý Hot Reload/Build, AI chỉ cần tập trung viết code `.dart` chất lượng.
* **Thiết kế & Tạo UI Mobile (Flutter)**:
  - Giao diện phải hiện đại, trực quan, hỗ trợ Responsive tốt cho nhiều kích thước màn hình (sử dụng `MediaQuery`, `LayoutBuilder` hoặc thư viện như `flutter_screenutil` nếu có sẵn).
  - **Tách các thành phần Widget con**: Tách các thành phần giao diện nhỏ (như Card, Item, Button, Header...) thành các Widget riêng biệt và lưu trữ tại thư mục `widgets/` của feature đó, hoặc trong thư mục `shared/widgets/` nếu là widget dùng chung toàn dự án. Tránh định nghĩa trực tiếp các widget con phức tạp bên trong file Screen để giữ file ngắn gọn, dễ chỉnh sửa và dễ bảo trì.
  - **Bắt buộc**: Tách biệt UI và Logic. Sử dụng **Bloc** hoặc **Cubit** để quản lý trạng thái UI. Tuyệt đối không lạm dụng `setState` hoặc viết logic xử lý API/nghiệp vụ trực tiếp bên trong giao diện Widget.
* **Thiết kế & Đồng bộ UI Web Admin (React/Tailwind)**:
  - **Đồng bộ tone màu**: Bắt buộc sử dụng tone màu tối giản hiện đại (Minimalist & Sleek) đã có sẵn:
    - Màu nhấn/chính (Primary/Active): `bg-gray-900` (hoặc `bg-gray-800` khi hover) kết hợp chữ trắng (`text-white`).
    - Màu nền phụ: `bg-gray-50` cho các ô input, background nền chung.
    - Màu viền (Borders): `border-gray-200` (viền panel, input, card) hoặc `border-gray-100` (viền phân cách mỏng).
    - Màu văn bản: `text-gray-900` (tiêu đề, label đậm), `text-gray-700` hoặc `text-gray-600` (văn bản thường, mô tả), `text-gray-500` hoặc `text-gray-400` (chú thích nhỏ, footer).
  - **Bo góc & Shadow**: Thiết kế sử dụng các góc bo lớn và mềm mại.
    - `rounded-2xl` cho các nút bấm (buttons), ô nhập liệu (inputs), các item trong danh sách/sidebar.
    - `rounded-3xl` cho các card lớn, khung form hoặc các container chính.
    - `rounded-xl` cho khung chứa biểu tượng (icon wrapper).
    - Bóng đổ nhẹ nhàng: `shadow-sm` cho các panel/sidebar, `shadow-md` cho card, `shadow-lg` cho active items.
  - **Icons**: Đồng bộ sử dụng thư viện Phosphor Icons (`react-icons/pi`) để giữ tính nhất quán về visual style.
  - **Tính nhất quán**: Khi tạo trang mới hoặc bổ sung component mới, AI tuyệt đối không tự ý dùng các màu sắc sặc sỡ khác ngoài bảng màu xám đen tối giản trên, trừ khi có yêu cầu cụ thể đối với các trạng thái cảnh báo (đỏ, vàng, xanh lá) hoặc bản đồ.

---

## 4. Quy định làm việc với Cơ sở dữ liệu & Repository (Database Rules)
* **Tuân thủ Script Database**: Khi tạo hoặc cập nhật các Model và Repository, AI bắt buộc phải tham chiếu và tuân thủ chính xác cấu trúc bảng, kiểu dữ liệu (UUID, DOUBLE PRECISION,...), quan hệ khóa ngoại và các Index đã được khai báo tại file [script-db.sql](../script-db.sql) để đảm bảo đồng bộ hệ thống.
* **Chỉ thao tác dữ liệu thông qua API**: Khi thực hiện các nghiệp vụ thay đổi dữ liệu (ví dụ: tạo người dùng mới, cập nhật trạng thái, xóa tài khoản,...), bắt buộc phải lập trình viết mã nguồn chạy theo đúng luồng API chuẩn của hệ thống (Route -> Validator -> Controller -> Service -> Repository).
* **Cấm can thiệp trực tiếp vào DB**:
  - Tuyệt đối **KHÔNG** chạy trực tiếp các câu lệnh query (INSERT, UPDATE, DELETE) thủ công trên database để thay đổi dữ liệu, nhằm ngăn ngừa nguy cơ sai lệch dữ liệu và mất tính nhất quán.
  - Tuyệt đối **KHÔNG** chạy các câu lệnh phá hủy (DROP TABLE, ALTER, DROP COLUMN,...) trực tiếp trên database thực tế làm hỏng cấu trúc hệ thống.

