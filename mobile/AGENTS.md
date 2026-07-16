# Mobile Package Guidelines

Mobile application built with Flutter.

## Ngôn ngữ & Cách làm việc
- Bắt buộc trả lời, giải thích và viết tài liệu bằng tiếng Việt
- Chỉ thực hiện thay đổi lớn sau khi đã có xác nhận của người dùng
- Quy trình: Phân tích → Lên kế hoạch → Review/Xác nhận → Thực thi

## UI/UX Rescue Style
- Màu chủ đạo: `ColorConstants` (đỏ cứu hộ, cam cảnh báo, trắng)
- Nút khẩn cấp phải to, rõ, dễ bấm
- Typography: đậm, dễ đọc
- Ưu tiên hiển thị trạng thái kết nối và GPS
- Các màn cùng nhóm phải đồng bộ 100%
- Không dùng card/container trắng nổi giữa trang

## Architecture
`mobile/lib/`
- `core/` — Network, DI, Constants
- `shared/` — widget dùng chung
- `features/` — tính năng độc lập

## Technical Rules
- Đăng ký Service/Bloc trong `core/di`
- State management: dùng Bloc/Cubit hoặc ChangeNotifier Provider; không dùng `setState` cho logic nghiệp vụ
- Strict layering:
  - Service: gọi Dio, trả `Future<Response>` thô
  - Repository: business logic, storage, mapping model
  - Provider/Bloc: quản lý state UI
  - UI Screen: chỉ gọi Provider/Bloc
- Request phải có class riêng với `toJson()`
- Response/Model phải có `fromJson()`
- Network phải bọc `try-catch` ở Repository
- Ảnh/icon quản lý bằng class constants

## File Access Map
- Auth: `lib/features/auth/presentation/screens/` (`login_screen.dart`, `register_screen.dart`)
- Profile: `lib/features/user/presentation/screens/profile_screen.dart`
- History: `lib/features/history/presentation/screens/history_screen.dart`
- Chat: `lib/features/chat/presentation/screens/chat_screen.dart`
- Notification: `lib/features/notification/presentation/screens/notification_screen.dart`
- Map: `lib/features/rescuer/presentation/screens/rescuer_map_screen.dart`, `lib/features/victim/presentation/screens/victim_map_screen.dart`
- Constants: `lib/core/constants/` (`color_constants.dart`, `router_constants.dart`)
- Shared: `lib/shared/widgets/` (`bottom_nav_bar_widget.dart`)