# Mobile Package Guidelines

Mobile application built with Flutter.

## Commands
All commands must be executed in the `mobile/` directory:

| Task | Command | Description |
|------|---------|-------------|
| Install dependencies | `flutter pub get` | Get Flutter packages |
| Run app | `flutter run` | Run app on emulator or physical device |
| Run tests | `flutter test` | Run Dart unit/widget tests |
| Clean build | `flutter clean` | Delete build cache |

---

## 🏗️ Feature-First Clean Architecture (Quy định cấu trúc Code)
Để tối ưu hóa việc phân tách trách nhiệm, giảm thiểu dung lượng Token khi duyệt code và ngăn lỗi cấu trúc, mã nguồn Flutter tuân thủ kiến trúc Modular Clean Architecture theo các thư mục sau:

```
mobile/lib/
├── core/         # 1. Hạ tầng cốt lõi toàn ứng dụng (Không chứa logic nghiệp vụ cụ thể)
│   ├── network/  # Dio client, interceptors
│   ├── storage/  # SharedPreferences, secure storage
│   ├── di/       # Dependency Injection (GetIt)
│   └── session/  # Session quản lý thông tin đăng nhập hiện tại
├── shared/       # 2. Các Widget hoặc Model dùng chung giữa các Feature
└── features/     # 3. Chứa các module tính năng độc lập (Ví dụ: auth, chat, sos...)
    └── <feature_name>/
        ├── models/         # Model dữ liệu chuyển đổi JSON
        ├── data/           # Các Repository và Datasource giao tiếp API qua network/Dio
        └── presentation/   # Giao diện UI (Screens, Widgets) và Quản lý trạng thái (Bloc/Cubit)
```

### 1. Feature Layer (`src/features/<feature_name>/`)
Mỗi tính năng là một thực thể độc lập và khép kín:
- **`models/`**: Chứa các class Dart ánh xạ từ JSON của API (Sử dụng factory constructor `fromJson` / `toJson`).
- **`data/`**: Chứa các datasource thực hiện gọi API qua Dio (hoặc local storage) và các Repository implement logic lấy dữ liệu.
- **`presentation/`**:
  - Chứa UI (Màn hình chính, Widget phụ trợ).
  - **BẮT BUỘC**: Logic nghiệp vụ và trạng thái giao diện phải được quản lý bởi **Bloc** hoặc **Cubit**. **Tuyệt đối không viết logic nghiệp vụ phức tạp trực tiếp bên trong Widget (setState).**

### 2. Core Layer (`src/core/`)
- Chứa các module hạ tầng dùng chung không thay đổi theo nghiệp vụ cụ thể.
- **Quy tắc nghiêm ngặt**: **Tuyệt đối không import các class thuộc thư mục `features/` vào thư mục `core/`.** Điều này vi phạm nguyên tắc Dependency Rule của Clean Architecture và gây lỗi vòng lặp phụ thuộc (circular dependency).

### 3. Shared Layer (`src/shared/`)
- Chứa các widget tái sử dụng trên nhiều màn hình khác nhau (ví dụ: CustomButton, CustomTextField, LoadingSpinner).

---

## ⚠️ Quy định nghiêm ngặt phòng ngừa lỗi (Error Prevention)
1. **Dependency Injection**: Mọi Service, Repository, Bloc/Cubit phải được đăng ký trong hệ thống DI ([core/di](file:///d:/workspace/do_an_tot_nghiep/mobile/lib/core/di/)) trước khi gọi sử dụng. Tránh việc khởi tạo thủ công (`new Repository()`) trong UI widget.
2. **Sử dụng Package Imports**: Luôn ưu tiên dùng `import 'package:mobile/...'` thay vì import tương đối quá sâu để code rõ ràng và tránh lỗi khi di chuyển file giữa các thư mục.
3. **Quản lý bất đồng bộ**: Mọi tác vụ gọi mạng (network) phải được bọc trong các khối `try-catch` tại lớp Repository/Datasource và trả về các kiểu dữ liệu an toàn hoặc throw lỗi được kiểm soát tốt.
