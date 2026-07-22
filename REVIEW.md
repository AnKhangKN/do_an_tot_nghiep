# BÁO CÁO ĐÁNH GIÁ VÀ REVIEW TOÀN DIỆN DỰ ÁN

Tài liệu này cung cấp cái nhìn tổng quan, đánh giá cấu trúc hiện tại và đề xuất các giải pháp cải tiến cho dự án **do_an_tot_nghiep** (bao gồm Web Admin, Server API và Mobile App).

---

## I. Tổng Quan Kiến Trúc Dự Án
Dự án được tổ chức theo cấu trúc **Monorepo** với 3 package chính:
* `web/`: Ứng dụng Web dành cho Admin quản lý và điều phối cứu hộ (React-Vite, TailwindCSS, React Leaflet).
* `server/`: Hệ thống Backend API phục vụ nghiệp vụ cứu hộ (ExpressJS, PostgreSQL, Socket.io).
* `mobile/`: Ứng dụng di động dành cho Cứu hộ viên (Rescuer) và Nạn nhân (Victim) (Flutter, Bloc/Provider).

> [!NOTE]
> Dự án áp dụng kiến trúc tách biệt rõ ràng trách nhiệm ở cả 3 phía: Server dùng Layered Modular, Mobile dùng Clean Architecture (Feature-First), Web dùng Redux quản lý state tập trung. Đây là cấu trúc rất tốt cho việc bảo trì.

---

## II. Đánh Giá Chi Tiết & Đề Xuất Cải Tiến

### 1. Backend (Server - ExpressJS)
#### Đánh giá hiện tại:
* Cấu trúc Modular (`routes` -> `validator` -> `controller` -> `service` -> `repository` -> `model`) giúp cô lập các module nghiệp vụ rất tốt.
* Sử dụng Socket.io để truyền và cập nhật thông tin thời gian thực.

#### Các điểm cần cải tiến & giải pháp:

* **Tối ưu hóa ghi Heartbeat lên Database (PostgreSQL) [ĐÃ HOÀN THÀNH]:**
  * *Đánh giá Redis:* Rất tốt là dự án **đã tích hợp Redis** và sử dụng các tính năng nâng cao như **Redis Geo** (`geoadd`) để quản lý tọa độ thời gian thực của Rescuer, **Pub/Sub** cho kết nối Websocket phân tán, và **BullMQ** để xử lý hàng đợi cứu hộ. Điều này giúp giảm tải cực lớn cho PostgreSQL khi cập nhật GPS.
  * *Chi tiết triển khai:* Thay vì chạy câu lệnh `UPDATE` trực tiếp vào PostgreSQL mỗi 15 giây khi nhận được sự kiện `rescuer:heartbeat`, mốc thời gian ISO của heartbeat được lưu trữ tạm thời trên Redis Hash Map (`rescuer:last_seen`).
  * *Cơ chế đồng bộ xuống DB:* Khi cứu hộ viên chuyển sang trạng thái offline (chủ động bấm offline hoặc do ngắt kết nối socket quá 15 giây), mốc thời gian hoạt động cuối từ cache Redis sẽ được đồng bộ cập nhật ghi đè một lần duy nhất vào cột `last_seen_at` của bảng `rescuer_profiles` trong PostgreSQL.
  * *Trạng thái dữ liệu trong DB:* Trong suốt phiên hoạt động online, cột `last_seen_at` trong DB PostgreSQL giữ nguyên (không đổi) để triệt tiêu tải ghi DB. Ngay khi offline, DB PostgreSQL sẽ cập nhật đầy đủ và chính xác mốc thời gian hoạt động cuối cùng của cứu hộ viên.
* **Đánh giá và Tối ưu hóa Lưu trữ Tọa độ (Redis Geo) & Queue Worker:**
  * *Cấu hình Redis (`redis.config.js`):* Cấu hình thiết lập `maxRetriesPerRequest: null` là hoàn toàn chính xác và bắt buộc khi làm việc với thư viện BullMQ để tránh crash tiến trình khi mất kết nối tạm thời.
  * *Vấn đề 1 (Dư thừa truy vấn Debug) [ĐÃ HOÀN THÀNH]:* Đã xóa bỏ hoàn toàn lệnh gọi `geopos` và in log `console.log(pos)` dư thừa trong tệp [rescuer_location.service.js](server/src/modules/location/service/rescuer_location.service.js). Sự thay đổi này giúp triệt tiêu request mạng dư thừa đến Redis, tăng đáng kể tốc độ xử lý khi cứu hộ viên cập nhật GPS đồng thời.
  * *Vấn đề 2 (Bộ nhớ rác Redis) [ĐÃ HOÀN THÀNH]:* Redis Sorted Set (`rescuer_locations`) không có tính năng hết hạn (TTL) tự động cho từng phần tử. Nếu cứu hộ viên bị mất mạng hoặc tắt nguồn đột ngột không thể gọi `offline` để chạy `zrem`, tọa độ của họ sẽ kẹt lại mãi mãi trong Redis. Mặc dù ở lớp Service có filter thời gian, nhưng danh sách trong Redis vẫn sẽ ngày càng dài và tốn dung lượng RAM.
  * *Giải pháp & Chi tiết triển khai:*
    * Khi cứu hộ viên cập nhật vị trí, hệ thống ghi tọa độ vào Redis Geo đồng thời tạo ra một key String phụ `active:rescuer:{userId}` có TTL 5 phút (300 giây) để báo hiệu hoạt động thực tế.
    * Khi Matching Service chạy tính năng tìm kiếm (`findNearbyRescuersForSOS`), hệ thống kiểm tra song song sự tồn tại của các key phụ này bằng `redis.pipeline()`.
    * Với những cứu hộ viên đã quá 5 phút không cập nhật GPS/heartbeat (không còn key phụ), hệ thống sẽ kích hoạt cơ chế **Lazy Cleanup**: tự động chạy lệnh `zrem('rescuer_locations', userId)` để dọn dẹp trực tiếp phần tử rác đó khỏi Redis Geo ngay lập tức, giải phóng bộ nhớ RAM mà không cần chạy job quét nặng nề.
* **Thuật toán tìm kiếm cứu hộ viên tối ưu [ĐÃ GIẢI QUYẾT BẰNG REDIS GEO]:**
  * *Đánh giá hiện tại:* Thực tế, do hệ thống đã chuyển dịch toàn bộ luồng định vị sang Redis, vấn đề tính toán khoảng cách chính xác đã được giải quyết một cách tối ưu nhất bằng việc sử dụng tùy chọn **`WITHDIST`** trong lệnh **`GEOSEARCH`** của Redis Geo ([rescuer.repository.js:210-220](server/src/modules/rescuer/repository/rescuer.repository.js#L210-L220)).
  * *Kết quả:* Lệnh `GEOSEARCH ... WITHDIST` tự động tính khoảng cách hình cầu chuẩn giữa tọa độ của Victim và Rescuer trên RAM Redis và trả về kết quả ngay lập tức dưới dạng số thực (km/m). Do đó, chúng ta hoàn toàn không cần cài đặt thêm thư viện tính Haversine thủ công ở NodeJS hay tích hợp PostGIS nặng nề ở PostgreSQL nữa. Các trường `DOUBLE PRECISION` và `geohash` trong DB PostgreSQL hiện tại chỉ phục vụ lưu trữ lịch sử lâu dài.
* **Quản lý Transaction trong Service [ĐÃ ĐẠT TIÊU CHUẨN]:**
  * *Đánh giá hiện tại:* Hệ thống **đã tuân thủ rất tốt** việc sử dụng Transaction của PostgreSQL thông qua helper `transaction(async (client) => { ... })` tại các nghiệp vụ cốt lõi ở lớp Service (ví dụ: `createSOS` kết hợp cập nhật số điện thoại nạn nhân tại `sos_request.service.js`, đăng ký tài khoản tại `auth.service.js`).
  * *Điểm cộng về thiết kế:* Các tác vụ mạng không thể rollback (như đẩy vào hàng đợi BullMQ `sosQueue.add` và cập nhật vị trí Redis `redis.geoadd`) đã được tách biệt đưa ra ngoài khối block `transaction` của PostgreSQL một cách chính xác. Điều này giúp ngăn ngừa việc giữ kết nối cơ sở dữ liệu lâu gây chậm hệ thống, và tránh lệch trạng thái dữ liệu (data inconsistency) khi DB bị rollback.

---

### 2. Mobile App (Flutter)
#### Đánh giá hiện tại:
* Đã cấu trúc theo mô hình Feature-First Clean Architecture rõ ràng.
* Background service đã được tối ưu để tránh gửi tọa độ ảo Hà Nội và đồng bộ chu kỳ heartbeat 15 giây.

#### Các điểm cần cải tiến & giải pháp:

* **Chuyển đổi sang cơ chế lắng nghe Stream định vị (Tối ưu nhất) [ĐÃ HOÀN THÀNH]:**
  * *Chi tiết triển khai:* Đã thay thế hoàn toàn cơ chế Polling cũ (dùng `Timer` gọi GPS định kỳ 5 giây) bằng cơ chế lắng nghe **Stream định vị thụ động (`Geolocator.getPositionStream`)** kết hợp cấu hình `distanceFilter` 10 mét.
  * *Kết quả:* Phần cứng GPS trên điện thoại sẽ chỉ bị kích hoạt để tính toán tọa độ khi cứu hộ viên thực sự di chuyển trên 10 mét, giúp tiết kiệm pin vượt trội.
  * *Duy trì Heartbeat:* Để tránh việc cứu hộ viên bị coi là offline khi đứng yên một chỗ (do stream không hoạt động), hệ thống duy trì một `Timer` riêng độc lập chạy mỗi 15 giây **chỉ để phát tín hiệu heartbeat (`rescuer:heartbeat`)**, không đụng chạm đến phần cứng định vị định kỳ, duy trì trạng thái online cực kỳ nhẹ nhàng.
* **Cơ chế hoạt động khi mất kết nối mạng (Offline Support) [ĐÃ HOÀN THÀNH]:**
  * *Chi tiết triển khai:* Tích hợp database cục bộ siêu nhẹ **Hive** (`hive_flutter`) và thiết lập hàng đợi ngoại tuyến `OfflineQueueService`.
  * *Kết quả:* Khi thiết bị mất sóng hoặc mất kết nối Socket, tọa độ GPS mới sẽ tự động được xếp hàng lưu tạm vào local DB. Ngay khi kết nối được khôi phục, hệ thống tự động chạy trình gửi bù (Retry Queue) để đồng bộ dữ liệu lịch sử lên Server và dọn dẹp sạch DB local. Cơ chế này sẵn sàng mở rộng cho cả các tính năng khác như lưu tạm tin nhắn chat chưa gửi.
* **UI/UX Khẩn cấp (SOS) [ĐÃ HOÀN THÀNH]:**
  * *Chi tiết triển khai:* Nút SOS đã được nâng cấp thành công từ cơ chế 1 chạm sang dạng **Ấn và giữ (Press and Hold) trong 2 giây** để chống bấm nhầm (False Alarm).
  * *Trải nghiệm người dùng:* Khi đè giữ, dòng chữ hiển thị đổi thành `"Giữ thêm..."`, viền tròn tiến trình (`CircularProgressIndicator`) màu đỏ đậm quay quanh nút SOS chạy đầy 100% sau 2 giây để mở form cứu hộ. Nếu thả tay giữa chừng, tiến trình trượt lùi về 0 (hủy bỏ lệnh kích hoạt) một cách mượt mà.

---

### 3. Web Admin (React - Vite - Leaflet) --- xử lý sau (Chưa cần thiết)
#### Đánh giá hiện tại:
* Sử dụng TailwindCSS v4 hiện đại kết hợp với Phosphor Icons đồng bộ visual style.
* Kiến trúc API tập trung và tích hợp bản đồ Leaflet phục vụ giám sát trực quan.

#### Các điểm cần cải tiến & giải pháp:

* **Tối ưu hóa Rendering Bản đồ:**
  * *Vấn đề:* Khi hiển thị hàng trăm điểm cứu hộ hoặc vị trí cứu hộ viên cùng một lúc, bản đồ Leaflet có thể bị lag do phải render quá nhiều DOM Elements (Markers).
  * *Giải pháp:* Tích hợp thư viện **Leaflet Marker Cluster** để gom nhóm các marker gần nhau lại khi thu nhỏ bản đồ (Zoom out), chỉ rã ra khi phóng to bản đồ (Zoom in).
* **Đồng bộ Real-time trạng thái ca cứu hộ:**
  * *Vấn đề:* Khi có một vụ tai nạn SOS mới được tạo từ di động, màn hình Admin cần cập nhật ngay lập tức mà không yêu cầu reload trang.
  * *Giải pháp:* Lắng nghe sự kiện socket `sos:request:new` để cập nhật trực tiếp danh sách sự cố khẩn cấp trên Redux Store và vẽ Marker mới lên bản đồ thời gian thực.

---

### 4. Cơ sở dữ liệu (PostgreSQL - script-db.sql)
#### Đánh giá hiện tại:
* Đầy đủ các bảng cơ bản: `users`, `rescuer_profiles`, `sos_requests`, `notifications`, `vehicles`, `images`.

#### Các điểm cần cải tiến & giải pháp:

* **Bổ sung các Ràng buộc & Indexes tối ưu:**
  * Nên đánh thêm Index ở các trường thường xuyên lọc và tìm kiếm ở điều kiện `WHERE` như `sos_requests(status, created_at)` để tăng tốc độ truy vấn báo cáo.
  * Nên đảm bảo trường `phone` của bảng `users` được chuẩn hóa định dạng (ví dụ dùng regex kiểm tra số điện thoại quốc tế/Việt Nam ở tầng Validator của Server).

---

## III. Các Tính Năng Nên Bổ Sung / Loại Bỏ

| Loại | Tính năng đề xuất | Chi tiết nghiệp vụ |
|---|---|---|
| **Nên thêm** | Cơ chế xác thực OTP qua SMS/Zalo | Giúp xác thực chính xác số điện thoại của nạn nhân khi gửi SOS, tránh các yêu cầu phá hoại hoặc giả mạo. |
| **Nên thêm** | Gửi kèm ảnh chụp hiện trường | Cho phép nạn nhân tải lên hình ảnh hiện trường tai nạn thông qua module `image` lên Cloudinary để cứu hộ viên đánh giá mức độ nghiêm trọng trước khi đến. |
| **Nên thêm** | Chat thời gian thực tích hợp | Tích hợp chat nhanh hoặc gọi điện trực tiếp giữa Victim và Rescuer đã ghép đôi thành công. |
| **Nên bỏ** | Gọi trực tiếp DB từ Web App | Đảm bảo tính nhất quán bảo mật: Tuyệt đối không cho phép bất kỳ truy vấn SQL nào trực tiếp từ Frontend Web, mọi tác vụ phải thông qua API Server. |
| **Nên bỏ** | Gửi tọa độ liên tục khi đứng yên | Đã sửa đổi (chỉ gửi khi di chuyển > 10m và heartbeat 15s) - giúp bảo vệ tài nguyên hệ thống. |

---

## IV. Kết Luận
Dự án có nền tảng kiến trúc rất vững chắc và đúng định hướng phân tách các lớp (Layered). Để dự án đạt chất lượng tốt nhất phục vụ cho đồ án tốt nghiệp, bạn nên ưu tiên triển khai:
1. **Hoàn thiện luồng kết nối socket real-time** giữa Victim - Server - Rescuer - Admin.
2. **Sử dụng cache định vị bằng Redis** để tối ưu hóa tài nguyên server.
3. **Bổ sung chat thời gian thực** và **gửi ảnh hiện trường** để nâng cao trải nghiệm ứng dụng cứu hộ thực tế.
