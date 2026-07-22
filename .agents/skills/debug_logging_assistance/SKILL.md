---
name: debug_logging_assistance
description: Trigger khi: sửa lỗi, gặp bug, điều tra sự cố, đính kèm log console.log hoặc debugPrint. Hướng dẫn AI tự động thêm các câu lệnh log chi tiết tại các mốc xử lý quan trọng khi phát triển hoặc sửa lỗi.
---

# Quy chuẩn đính kèm Log để Debug & Trace lỗi (Debug Logging Assistance)

Kỹ năng này hướng dẫn AI và lập trình viên cách đặt log khoa học, nhất quán trên toàn bộ hệ thống (Server Node.js, Mobile Flutter, Web React) giúp dễ dàng phát hiện và truy vết nguyên nhân gây lỗi trong quá trình phát triển.

---

## 1. Nguyên tắc đặt Log khi gặp lỗi hoặc điều tra Bug
- **Không đoán mò nguyên nhân**: Khi code xảy ra lỗi hoặc hoạt động không đúng kỳ vọng, bắt buộc đính kèm các câu lệnh log tại các mốc xử lý quan trọng (Boundary Checks, Input/Output, State Transition, Async Calls).
- **Log có ngữ cảnh rõ ràng**: Mỗi câu lệnh log phải chứa tên module/tính năng, giá trị của biến thực tế và lý do rẽ nhánh.

---

## 2. Định dạng chuẩn cho Log các package

### 🖥️ Server (Node.js / Express.js)
Sử dụng `console.log()` hoặc `console.error()` có gắn tiền tố module:
- **Định dạng tiền tố**: `[MODULE_NAME] [FUNCTION_NAME] Mô tả: giá_trị`
- **Ví dụ**:
  ```javascript
  console.log(`[MATCHING] SOS ${sosId} radius ${radius}km - raw nearby rescuers:`, nearbyRescuers);
  console.log(`[SOCKET] Nhận vị trí từ user: ${userId} (${lat}, ${lng})`);
  console.error(`[SERVICE] Lỗi trong cancelSOS:`, error);
  ```

### 📱 Mobile (Flutter / Dart)
Sử dụng `debugPrint()` kết hợp Emoji trực quan để nhận biết trong Android Studio Logcat / Flutter Console:
- 🟢 `debugPrint('🟢 [VICTIM SOCKET] Nhận rescuer:location:updated: $data');` (Sự kiện thành công/Realtime)
- 🚨 `debugPrint('🚨 [SOSProvider] Xử lý SOS bị hủy bởi Victim: $cancelledSosId');` (Cảnh báo quan trọng)
- ❌ `debugPrint('❌ [PARSE ERROR] Lỗi chuyển đổi Model: $e');` (Ngoại lệ / Catch Error)

### 🌐 Web (React.js)
Sử dụng `console.log()` / `console.error()` kèm thông tin cụ thể:
- `console.log("[REDUX/API] Fetching SOS list with params:", params);`
- `console.error("[COMPONENT] Render error at MapScreen:", error);`

---

## 3. Các vị trí bắt buộc phải gắn Log khi Debug

1. **Đầu và cuối các hàm Async / Gọi API / Query DB / Redis**:
   - Log tham số đầu vào trước khi gọi API / Query.
   - Log kết quả trả về hoặc lỗi trong khối `catch (error)`.
2. **Các điều kiện rẽ nhánh (if / else / filter)**:
   - Log cụ thể lý do tại sao dữ liệu bị loại bỏ (ví dụ: `console.log("[MATCHING] loại ${userId} vì thiếu active:rescuer:${userId}");`).
3. **Các Handler xử lý sự kiện Realtime (Socket.IO Listeners)**:
   - Log dữ liệu raw ngay khi socket nhận event và log sau khi parse model.

---

## 4. Quy định an toàn
- **Nghiêm cấm log thông tin nhạy cảm**: Không bao giờ log mật khẩu (passwords), mã mã hóa, Refresh Token, Access Token hoặc PII cá nhân nhạy cảm của người dùng.
