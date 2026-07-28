# BÁO CÁO REVIEW DỰ ÁN TỐT NGHIỆP

> **Hệ thống:** Ứng dụng cứu hộ khẩn cấp thời gian thực  
> **Stack:** Monorepo gồm `server/` (Express.js), `web/` (React + Vite), `mobile/` (Flutter)  
> **Cập nhật:** 07/2026

---

## I. Tổng quan đã hoàn thành

Dự án đã triển khai đầy đủ 3 lớp sản phẩm:

- **Backend**: kiến trúc modular theo tầng, dùng PostgreSQL, Redis, BullMQ, Socket.io.
- **Mobile**: app Flutter theo hướng feature-first, tập trung cho nạn nhân và cứu hộ viên.
- **Web Admin**: dashboard quản trị theo thời gian thực, hỗ trợ giám sát và điều phối.

---

## II. Kết quả chính theo từng nền tảng

### 1. Backend Server
Backend đã hoàn thiện các module chính:

- **Auth / User**: đăng ký, đăng nhập JWT, refresh token, xác thực email OTP, Google Sign-In.
- **SOS**: tạo yêu cầu khẩn cấp, đính kèm ảnh, theo dõi lịch sử, cập nhật trạng thái, phát socket realtime.
- **Rescuer / Location / Matching**: quản lý cứu hộ viên online, cập nhật GPS, tìm kiếm theo khoảng cách, ghép đôi tự động.
- **Dispatch / Chat / Notification**: gửi lời mời nhận ca, nhắn tin, đẩy thông báo FCM.
- **Dangerous Points / Emergency Amenities / Rating / Dashboard**: quản lý điểm nguy hiểm, tiện ích khẩn cấp, đánh giá sau cứu hộ, thống kê realtime.

**Điểm nổi bật kỹ thuật**
- BullMQ worker xử lý ghép đôi theo nhiều vòng bán kính.
- Redis Geo dùng để tìm kiếm cứu hộ viên gần nhất nhanh hơn.
- Dữ liệu online được tối ưu bằng TTL và cơ chế dọn rác tự động.
- Socket được dùng cho cập nhật trạng thái gần như tức thời.

---

### 2. Mobile App
Ứng dụng Flutter đã có các tính năng chính:

- **Nút SOS giữ 2 giây** để giảm chạm nhầm.
- **Đính kèm ảnh hiện trường** khi gửi SOS.
- **Tự khôi phục socket và refresh token** khi token hết hạn.
- **Tìm kiếm tiện ích khẩn cấp thông minh** theo vị trí gần nhất.
- **Xem ảnh hiện trường / tiện ích ở chế độ phóng to**.
- **Theo dõi GPS và đồng bộ vị trí nền**.
- **Hàng đợi offline** để lưu và gửi lại dữ liệu khi mất mạng.
- **Chỉ đường OSRM và ETA realtime** cho cả nạn nhân và cứu hộ viên.
- **Lịch sử ca cứu hộ**, **push notification**, và **geofencing cảnh báo vùng nguy hiểm**.

**Điểm nổi bật kỹ thuật**
- Ưu tiên trải nghiệm khẩn cấp: thao tác ít, phản hồi nhanh, hiển thị rõ trạng thái.
- Có cơ chế tự động đồng bộ khi mạng chập chờn.
- Giao diện và luồng xử lý được thiết kế để hỗ trợ tình huống thực tế ngoài hiện trường.

---

### 3. Web Admin
Trang quản trị đã có các màn hình chính:

- **Dashboard**: thống kê realtime và live push.
- **Map**: bản đồ, heatmap, theo dõi điểm nóng.
- **Emergency Amenity**: quản lý tiện ích cộng đồng và báo cáo vi phạm.
- **Rescuer / User / Incident Type**: quản lý dữ liệu nền.
- **Rescuer Analytics**: thống kê hiệu suất cứu hộ viên.
- **Notification**: gửi broadcast FCM.
- **Feedback / Profile**: xem đánh giá và thông tin admin.

**Điểm nổi bật kỹ thuật**
- Có socket live push cho dashboard.
- Có heatmap điểm nóng tai nạn.
- Có luồng duyệt / gỡ điểm tiện ích vi phạm.
- Có trang thống kê và xếp hạng cứu hộ viên.

---

## III. Các cải tiến quan trọng đã triển khai

### 1. Chỉ đường OSRM cho cứu hộ viên
- Hiển thị khoảng cách và ETA ngay trên màn hình cứu hộ.
- Tự cập nhật khi cứu hộ viên di chuyển.

### 2. Lịch sử ca cứu hộ và thống kê
- Mobile hiển thị lịch sử ca và bộ lọc trạng thái.
- Web admin có thống kê tổng hợp và các chỉ số vận hành.

### 3. Heatmap tai nạn
- Tổng hợp điểm nóng từ dữ liệu SOS.
- Hiển thị trực quan trên bản đồ admin.

### 4. Rating & Feedback
- Nạn nhân đánh giá sau ca cứu hộ.
- Admin xem được đánh giá và phản hồi thực tế.

### 5. Geofencing vùng nguy hiểm
- Cảnh báo theo bán kính GPS.
- Có cooldown để tránh spam cảnh báo.

### 6. Crowd-sourced dangerous zones
- Tự phát hiện cụm SOS bất thường để gợi ý điểm nguy hiểm.
- Hỗ trợ admin quản lý tốt hơn.

### 7. Live dashboard realtime
- Admin thấy được sự kiện SOS gần như ngay lập tức.
- Cập nhật trạng thái ca cứu hộ theo socket.

### 8. QR emergency fallback
- Có phương án dự phòng khi không tìm thấy cứu hộ online.
- Hỗ trợ nhận ca qua QR code.

### 9. Emergency amenities
- Bản đồ tiện ích khẩn cấp.
- Có chỉ đường nội bộ và cơ chế duyệt từ admin.

### 10. SOS kèm ảnh hiện trường
- Nạn nhân gửi ảnh cùng yêu cầu cứu hộ.
- Cứu hộ viên xem nhanh trước khi nhận ca.

### 11. Báo cáo vi phạm tiện ích
- Người dùng báo tiện ích giả mạo / đóng cửa / sai thông tin.
- Admin xử lý ngay trên trang quản trị.

### 12. Smart search tiện ích khẩn cấp
- Ưu tiên kết quả gần nhất.
- Tự ẩn/hiện danh mục theo trạng thái tìm kiếm.

### 13. Kênh hỗ trợ khẩn cấp đa admin
- Người dùng có thể liên hệ tổng đài hỗ trợ nhanh.
- Admin trực ca cùng nhận và trả lời realtime.

---

## IV. Luồng cốt lõi của hệ thống

1. Nạn nhân giữ nút SOS và gửi vị trí, loại sự cố, ảnh hiện trường.
2. Server lưu yêu cầu và đẩy job vào worker.
3. Worker tìm cứu hộ viên gần nhất theo nhiều vòng bán kính.
4. Nếu có người phù hợp, hệ thống gửi socket và thông báo.
5. Cứu hộ viên nhận ca, hệ thống cập nhật trạng thái cho nạn nhân.
6. Trong quá trình di chuyển, vị trí được đẩy realtime và bản đồ tự cập nhật.
7. Sau khi hoàn thành, nạn nhân đánh giá lại chất lượng cứu hộ.

---

## V. Đánh giá tổng hợp

Dự án đã đạt mức hoàn thiện cao ở cả 3 nền tảng:

- **Backend**: có kiến trúc rõ ràng, đủ module, hỗ trợ realtime và mở rộng tốt.
- **Mobile**: tối ưu cho tình huống khẩn cấp, thao tác nhanh, có offline và realtime.
- **Web Admin**: phục vụ giám sát, điều phối, thống kê và kiểm duyệt dữ liệu.

### Giá trị chính của dự án
- Kết nối nạn nhân, cứu hộ viên và admin trong một luồng thống nhất.
- Tối ưu cho tình huống khẩn cấp, nơi tốc độ và độ ổn định là ưu tiên hàng đầu.
- Có nhiều cơ chế dự phòng: socket, offline queue, QR fallback, tự refresh token.
- Dễ mở rộng thêm các tính năng cứu hộ và quản trị trong tương lai.

---

## VI. Đề xuất nâng cấp còn hợp lý để làm thêm

Phần này chỉ giữ các hướng chưa thấy triển khai rõ trong project, để tránh lặp lại những tính năng đã có.

### 1. AI phân loại nội dung báo cáo
- Tự động phân nhóm SOS, báo cáo vi phạm tiện ích, phản hồi người dùng hoặc nội dung chat theo chủ đề.
- Mục tiêu là giảm thao tác lọc thủ công cho admin.
- Đây là hướng AI dễ test hơn vì chỉ cần dữ liệu văn bản hoặc nhãn đơn giản.

### 2. AI phát hiện nội dung bất thường
- Nhận diện mô tả lặp lại, câu chữ bất thường, spam hoặc báo cáo nghi ngờ từ người dùng.
- Từ đó hệ thống có thể gợi ý kiểm duyệt hoặc đưa vào hàng chờ xem xét.
- Hướng này phù hợp vì không phụ thuộc thiết bị ngoài hiện trường.

### 3. AI gợi ý từ khóa tìm kiếm
- Hỗ trợ người dùng và admin tìm nhanh SOS, tiện ích, phản hồi hoặc lịch sử theo từ khóa liên quan.
- Có thể tự đề xuất từ khóa gần nghĩa, viết tắt hoặc lỗi chính tả thường gặp.
- Dễ triển khai, dễ mô phỏng và phù hợp với hệ thống có nhiều dữ liệu văn bản.

### 4. AI tóm tắt lịch sử hoạt động
- Tự động rút gọn lịch sử ca cứu hộ, phản hồi hoặc nhật ký admin thành nội dung ngắn.
- Giúp báo cáo và phần quản trị dễ đọc hơn.
- Hợp để trình bày trong đồ án vì thể hiện AI hỗ trợ tổng hợp thông tin.

### 5. Báo cáo tự động cho admin
- Sinh file PDF/Excel theo ngày, tuần, tháng: số ca SOS, tỷ lệ nhận ca, thời gian phản hồi, khu vực nóng.
- Đây là hướng rất hợp đồ án vì thể hiện khả năng tổng hợp và khai thác dữ liệu.

### 6. Kênh liên hệ khẩn cấp đa phương thức
- Bổ sung luồng gọi nhanh hoặc gửi thông tin tới số liên hệ khẩn cấp đã lưu sẵn.
- Phù hợp thực tế và giúp dự án có thêm điểm nhấn về tính ứng dụng.

### 7. Cơ chế nhắc nhở và theo dõi sau cứu hộ
- Sau khi hoàn tất ca, hệ thống tự gửi nhắc đánh giá, xác nhận an toàn hoặc cập nhật trạng thái sức khỏe cơ bản.
- Làm dự án tròn hơn ở khâu hậu xử lý.

## VII. Kết luận

Dự án đã hoàn thiện tốt ở các chức năng cốt lõi như SOS, ghép đôi cứu hộ, bản đồ, chỉ đường, thông báo, đánh giá, cảnh báo nguy hiểm và quản trị admin.

Nói ngắn gọn: **dự án đã có nền tảng vững, phần còn lại nếu mở rộng nên tập trung vào điều phối thông minh, báo cáo tự động và phân tích dữ liệu để tăng giá trị đồ án**.
