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

---

## Socket Architecture Pattern (BẮT BUỘC FOLLOW)

### Luồng chuẩn khi thêm sự kiện socket mới

```
Server emit event
      ↓
socket/modules/<role>_socket.dart    ← Duy nhất nơi đăng ký socket.on()
      ↓
SessionController.set<State>()       ← Cập nhật state tập trung
      ↓
SessionState.<field>                 ← Nơi lưu state
      ↓
UI dùng ListenableBuilder(SessionController) hoặc context.watch<SessionController>()
```

### Quy tắc bắt buộc

1. **Socket listener chỉ nằm trong `core/socket/modules/`**
   - Mỗi role có 1 file riêng: `rescuer_socket.dart`, `victim_socket.dart`,...
   - Tuyệt đối KHÔNG đăng ký `socket.on()` trong Provider, Screen, hay Widget

2. **State tập trung qua `SessionController` / `SessionState`**
   - Mọi trạng thái phát sinh từ socket phải được lưu vào `SessionState`
   - `SessionController` expose getter và setter tương ứng
   - Provider/Widget đọc state từ `SessionController`, không tự quản lý

3. **`AppSession` là nơi khởi động listener theo role**
   - Trong `AppSession.init()`: nếu role RESCUER → gọi `rescuerSocket.listenX()`, nếu role VICTIM → gọi `victimSocket.listenY()`
   - `AppSession` được inject tất cả socket module qua DI

4. **DI (`core/di/di.dart`) đăng ký socket module như singleton**
   ```dart
   getIt.registerLazySingleton(
     () => VictimSocket(getIt<CoreSocket>(), getIt<SessionController>()),
   );
   ```

5. **UI rebuild đúng cách**
   - Dùng `ListenableBuilder(listenable: getIt<SessionController>(), builder: ...)` trong Widget
   - Hoặc `context.watch<SessionController>()` nếu widget đã nằm trong Provider tree của SessionController

### Ví dụ tham chiếu
- Rescuer nhận SOS offer: [`rescuer_socket.dart`](lib/core/socket/modules/rescuer_socket.dart) → `sosProvider.receiveSOS()`
- Victim nhận kết quả tìm kiếm thất bại: [`victim_socket.dart`](lib/core/socket/modules/victim_socket.dart) → `sessionController.setSearchingRescuer(false)`

### KHÔNG làm những điều sau
- ❌ `socket.on()` bên trong Provider
- ❌ `socket.on()` bên trong `initState()` của Screen/Widget
- ❌ Dùng callback/VoidCallback để truyền sự kiện socket từ Provider lên UI
- ❌ Quản lý trạng thái socket trong biến local của widget

---

## Animation Pattern & Reusable Tween (Quy tắc viết Animation & Tái sử dụng)

### Thư mục chung `core/animation/`
- Mọi Tween tự định nghĩa hoặc các lớp xử lý hiệu ứng chuyển động dùng chung phải được đặt tại `lib/core/animation/`.
- File ví dụ: [`lat_lng_tween.dart`](lib/core/animation/lat_lng_tween.dart) - dùng để nội suy mượt mà vĩ độ và kinh độ của `LatLng`.

### Quy tắc khi làm việc với Bản đồ & Markers
1. **Tránh marker nhảy giật cục**:
   - Khi cập nhật tọa độ (`LatLng`) cho marker trên bản đồ, tuyệt đối không thay đổi giá trị tọa độ của Marker tức thời.
   - Bắt buộc dùng `AnimationController` kết hợp với `LatLngTween` để nội suy mượt mà vị trí của Marker trong thời gian 1 giây (1000ms).
2. **Xử lý xung đột import**:
   - Thư viện `flutter_map` có định nghĩa lớp private `LatLngTween` gây xung đột (ambiguous import) với `LatLngTween` trong core.
   - Khi import `flutter_map` ở các file sử dụng `LatLngTween` từ core, bắt buộc phải ẩn đi bằng cách:
     ```dart
     import 'package:flutter_map/flutter_map.dart' hide LatLngTween;
     import 'path/to/core/animation/lat_lng_tween.dart';
     ```