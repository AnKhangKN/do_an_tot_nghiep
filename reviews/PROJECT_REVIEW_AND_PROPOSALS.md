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
- **SOS & QR Fallback**: tạo yêu cầu khẩn cấp, đính kèm ảnh, theo dõi lịch sử, tiếp nhận ca khẩn cấp qua QR Code, cập nhật trạng thái, phát socket realtime.
- **Rescuer / Location / Matching**: quản lý cứu hộ viên online, cập nhật GPS, tìm kiếm theo khoảng cách, ghép đôi tự động.
- **Dispatch / Chat / Notification**: gửi lời mời nhận ca, nhắn tin, đẩy thông báo FCM.
- **Dangerous Points & Crowd-Sourced Clustering**: quản lý điểm nguy hiểm, thuật toán tự động gom cụm mật độ SOS (>= 3 ca trong bán kính 200m) để tự phát hiện vùng rủi ro mới.
- **Emergency Amenities / Rating / Dashboard**: quản lý tiện ích khẩn cấp, đánh giá chất lượng phục vụ, thống kê realtime.
- **Quét & Gộp Tiện ích Trùng lặp (Duplicate Detection & Merge)**: thuật toán không gian phân tích khoảng cách GPS (< 200m) và so sánh trùng SĐT/danh mục để phát hiện các cặp tiện ích trùng lặp, hỗ trợ gộp toàn bộ ảnh/feedback sang bản ghi chính và làm sạch dữ liệu trong database transaction.
- **Báo cáo Vận hành Tự động (Automated Operational Reports Export)**: tính năng trích xuất báo cáo dữ liệu vận hành cứu hộ chuẩn CSV/Excel (UTF-8 BOM chống lỗi font tiếng Việt) chứa đầy đủ thông tin ca SOS, nạn nhân, cứu hộ viên, GPS và mốc thời gian qua API endpoint dedicated.
- **Cơ chế Nhắc nhở & Theo dõi sau Cứu hộ (Post-Rescue Safety Check-in)**: dịch vụ hậu xử lý tự động ghi nhận thông tin xác nhận an toàn, trạng thái sức khỏe ("Tôi đã an toàn", "Cần kiểm tra y tế", "Đang hồi phục"), ghi chú bổ sung và kết hợp đồng bộ điểm đánh giá 1-5 sao về Cứu hộ viên qua API endpoint dedicated.
- **AI Tóm tắt Lịch sử & Hiệu suất Vận hành (AI Activity & Operations Summary)**: dịch vụ tự động phân tích chỉ số cứu hộ, tiếp nhận ca khẩn cấp và hiệu suất vận hành theo khung thời gian (7-30 ngày) để sinh báo cáo tóm tắt điều hành (Executive Summary) bằng Groq Cloud API (Llama 3.3/70b) kết hợp bộ tổng hợp NLP dự phòng.
- **AI Moderation (Kiểm duyệt Nội dung Tự động)**: phân tích và kiểm duyệt văn bản tự động qua Groq Cloud API (Llama 3.3/70b) kết hợp bộ lọc NLP Tiếng Việt; tích hợp thuật toán Cross-Module Early Block (chặn sớm liên module) và Safe Pass (bỏ qua trùng lặp an toàn) để tiết kiệm 100% token, chạy bất đồng bộ cho 4 thực thể (`SOS_REQUEST`, `RESCUER_RATING`, `AMENITY_FEEDBACK`, `CHAT_MESSAGE`).

**Điểm nổi bật kỹ thuật**
- BullMQ worker xử lý ghép đôi theo nhiều vòng bán kính.
- Redis Geo dùng để tìm kiếm cứu hộ viên gần nhất nhanh hơn.
- Dữ liệu online được tối ưu bằng TTL và cơ chế dọn rác tự động.
- Socket được dùng cho cập nhật trạng thái gần như tức thời.
- Cơ chế AI Moderation Non-blocking không gây nghẽn luồng xử lý API.

---

### 2. Mobile App
Ứng dụng Flutter đã có các tính năng chính:

- **Nút SOS giữ 2 giây** để giảm chạm nhầm.
- **SOS kèm Ảnh Hiện trường & Xem nhanh Preview**: Nạn nhân đính kèm ảnh khi phát SOS; Cứu hộ viên xem nhanh ảnh hiện trường trên popup overlay (hỗ trợ phóng to fullscreen) trước khi chọn nhận ca.
- **Kênh Liên hệ Khẩn cấp Đa phương thức (Emergency Multi-channel Quick Contacts & SOS SMS)**: bộ công cụ liên hệ khẩn cấp 3 phân mục gồm: Gọi tổng đài quốc gia 24/7 (115, 114, 113, 112), Phát tin nhắn SMS khẩn cấp đính kèm tọa độ định vị GPS Google Maps thời gian thực, và Quản lý/Gọi nhanh số điện thoại người thân khẩn cấp cá nhân (lưu bảo mật qua Secure Storage).
- **Theo dõi Sức khỏe & Xác nhận An toàn sau Cứu hộ (Post-Rescue Check-in Sheet)**: giao diện popup tự động hiển thị ngay sau khi ca cứu hộ hoàn tất, cho phép nạn nhân nhanh chóng chọn tình trạng sức khỏe, ghi chú phản hồi và chấm điểm chất lượng hỗ trợ.
- **Bản đồ Tiện ích Khẩn cấp (Emergency Amenities)**: hiển thị điểm hỗ trợ (bệnh viện, trạm xăng, sửa xe...) gần nhất kèm tính năng chỉ đường nội bộ OSRM thời gian thực.
- **Smart Search Tiện ích Khẩn cấp**: tìm kiếm từ khóa/danh mục linh hoạt, tự động tính khoảng cách GPS và sắp xếp ưu tiên các địa điểm gần nhất đứng đầu, tự ẩn/hiện danh mục gợi ý theo trạng thái tìm kiếm.
- **QR Emergency Fallback (Dự phòng nhận ca qua QR)**: phương án khẩn cấp khi mất mạng/không có cứu hộ online; Nạn nhân tạo & tải ảnh mã QR ca SOS về máy để gửi qua MXH, Cứu hộ viên quét camera hoặc tải ảnh QR từ thư viện để tiếp nhận ca.
- **Tự khôi phục socket và refresh token** khi token hết hạn.
- **Xem ảnh hiện trường / tiện ích ở chế độ phóng to**.
- **Theo dõi GPS và đồng bộ vị trí nền**.
- **Hàng đợi offline** để lưu và gửi lại dữ liệu khi mất mạng.
- **Chỉ đường OSRM và ETA thời gian thực** cho cứu hộ viên (tự cập nhật theo di chuyển GPS, tự fit camera bản đồ và hỗ trợ fallback đường chim bay).
- **Lịch sử ca cứu hộ & bộ lọc trạng thái**, **push notification**, và **Geofencing cảnh báo vùng nguy hiểm** (bán kính linh hoạt theo mức độ rủi ro HIGH 500m / MEDIUM 350m / LOW 200m kèm Cooldown 10 phút chống spam).
- **Phản hồi Lỗi Kiểm duyệt AI (!)**: hiển thị icon cảnh báo đỏ `!` bên cạnh các tin nhắn/nội dung bị từ chối kèm Modal xem chi tiết lý do vi phạm.

**Điểm nổi bật kỹ thuật**
- Ưu tiên trải nghiệm khẩn cấp: thao tác ít, phản hồi nhanh, hiển thị rõ trạng thái.
- Có cơ chế tự động đồng bộ khi mạng chập chờn.
- Có kênh liên hệ đa phương thức 24/7 (Gọi tổng đài, phát SMS vị trí GPS và số người thân khẩn cấp).
- Có quy trình hậu xử lý đầy đủ với giao diện xác nhận an toàn & theo dõi sức khỏe sau cứu hộ.
- Giao diện và luồng xử lý được thiết kế để hỗ trợ tình huống thực tế ngoài hiện trường.

---

### 3. Web Admin
Trang quản trị đã có các màn hình chính:

- **Live Dashboard Realtime**: theo dõi chỉ số hệ thống khẩn cấp theo thời gian thực, tự động lắng nghe diễn biến ca SOS qua Socket.io (tạo mới, tiếp nhận, hoàn thành, hủy) và hiển thị thông báo Toast cảnh báo tức thì.
- **Xuất Báo cáo CSV/Excel Vận hành**: nút bấm 1-click "Xuất Báo Cáo CSV" trực tiếp trên thanh Header Dashboard cho phép Admin chủ động tải báo cáo dữ liệu vận hành theo khung thời gian (7-30 ngày).
- **Card AI Tóm Tắt Vận Hành Hệ Thống (AI Operational Activity Summary Card)**: widget tóm tắt thông minh ngay trên trang Live Dashboard, trang bị nút 1-click "Tạo Tóm Tắt AI" hiển thị văn bản tóm tắt điều hành, 3 điểm nổi bật chính và khuyến nghị điều phối cho Admin.
- **Kênh Hỗ trợ Khẩn cấp Đa Admin (Multi-Admin Support Chat Widget)**: tổng đài trao đổi trực tiếp nổi trên toàn trang quản trị, cho phép đa Admin cùng trực ca tiếp nhận và nhắn tin hỗ trợ người dùng/nạn nhân theo thời gian thực qua Socket.io kèm chấm đỏ thông báo chưa đọc.
- **Map & Heatmap điểm nóng**: bản đồ điểm nóng tai nạn/cứu hộ với trọng số độ nguy cấp (intensity động), tự động căn chỉnh góc nhìn (auto-fit bounds) và thẻ thống kê trực quan.
- **Quản lý Vùng Nguy Hiểm (Dangerous Zones)**: duyệt các điểm rủi ro do người dùng gửi hoặc do hệ thống tự động quét gom cụm SOS (Crowd-Sourced) kèm nút bấm "Quét cụm SOS tự động".
- **Quản lý Tiện ích Khẩn cấp & Báo cáo Vi phạm (Amenity Feedbacks)**: quản lý danh mục, xem hình ảnh thực tế đính kèm, phê duyệt điểm tiện ích do người dùng đóng góp và xử lý báo cáo vi phạm (gỡ điểm lừa đảo/đóng cửa hoặc bác bỏ báo cáo).
- **Tab Quét & Gộp Tiện ích Trùng lặp (Duplicate Detection & Merge)**: giao diện kiểm duyệt nghi ngờ trùng lặp với thiết kế so sánh 2 cột song song (Side-by-side) hiển thị lý do trùng khớp và nút bấm 1-click gộp dữ liệu (Merge) giúp bản đồ luôn sạch sẽ.
- **Trang Quản trị AI Moderation & Kiểm duyệt Nội dung**: màn hình quản trị riêng biệt theo dõi danh sách nội dung bị cắm cờ vi phạm tiêu chuẩn cộng đồng, xem văn bản phân tích gốc, tên người kiểm duyệt và Modal popup thao tác duyệt (`APPROVED`) hoặc bác bỏ (`DISMISSED`).
- **Rescuer / User / Incident Type**: quản lý dữ liệu nền.
- **Rescuer Analytics & Báo cáo vận hành**: thống kê tổng hợp hiệu suất và chỉ số ca cứu hộ.
- **Notification**: gửi broadcast FCM.
- **Feedback & Đánh giá chất lượng**: trang quản trị riêng theo dõi nhận xét thực tế từ Nạn nhân, điểm đánh giá trung bình (Avg Rating) và bộ lọc số sao (1-5 sao).

**Điểm nổi bật kỹ thuật**
- Có socket live push cho dashboard và tổng đài hỗ trợ khẩn cấp đa admin.
- Có heatmap điểm nóng tai nạn với trọng số độ nguy cấp thời gian thực.
- Có thuật toán tự động gom cụm dữ liệu SOS để gợi ý điểm nguy hiểm.
- Có luồng duyệt / gỡ điểm tiện ích vi phạm.
- Có thuật toán tự động quét trùng lặp và gộp tiện ích khẩn cấp (Merge).
- Có bộ công cụ trích xuất báo cáo vận hành tự động dạng file CSV/Excel.
- Có tính năng AI Tóm tắt lịch sử & báo cáo điều hành vận hành hệ thống cứu hộ.
- Có hệ thống kiểm duyệt nội dung tự động AI Moderation cho tất cả nguồn văn bản.
- Có trang thống kê và xếp hạng cứu hộ viên.

---

## III. Các cải tiến quan trọng đã triển khai

Tất cả các cải tiến nâng cao quan trọng (OSRM Routing, Heatmap Tai nạn, Rating & Feedback Analytics, Geofencing Vùng Nguy Hiểm, Crowd-Sourced Zones, Live Dashboard Realtime, QR Emergency Fallback, Emergency Amenities, SOS kèm ảnh hiện trường, Báo cáo vi phạm, Smart Search, Kênh Hỗ trợ Khẩn cấp Đa Admin, Kênh Liên hệ Khẩn cấp Đa phương thức, Post-Rescue Check-in, Duplicate Detection & Merge, AI Tóm tắt Lịch sử Vận hành, Báo cáo Vận hành Tự động, và AI Moderation) đã được triển khai, kiểm thử thành công và tích hợp trực tiếp vào kiến trúc cốt lõi của hệ thống ở **Mục II (Kết quả chính theo từng nền tảng)**.

---

## IV. Luồng cốt lõi của hệ thống

1. Nạn nhân giữ nút SOS và gửi vị trí, loại sự cố, ảnh hiện trường.
2. Server lưu yêu cầu và đẩy job vào worker.
3. Worker tìm cứu hộ viên gần nhất theo nhiều vòng bán kính.
4. Nếu có người phù hợp, hệ thống gửi socket và thông báo.
5. Cứu hộ viên nhận ca, hệ thống cập nhật trạng thái cho nạn nhân.
6. Trong quá trình di chuyển, vị trí được đẩy realtime và bản đồ tự cập nhật.
7. Sau khi hoàn thành, hệ thống hiển thị xác nhận an toàn & nạn nhân đánh giá lại chất lượng cứu hộ.

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

Tất cả các tính năng nâng cấp thiết thực và phù hợp nhất cho dự án đồ án đã được triển khai hoàn tất 100% và đưa trực tiếp vào kiến trúc hoạt động của sản phẩm ở **Mục II**.

---

## VII. Kết luận

Nói ngắn gọn: **dự án đã hoàn thiện toàn diện cả 3 nền tảng (Server, Mobile App, Web Admin) với đầy đủ luồng cứu hộ khẩn cấp thời gian thực, trí tuệ nhân tạo AI Moderation, tóm tắt báo cáo vận hành, kiểm duyệt dữ liệu tự động và quy trình hậu xử lý an toàn chuyên nghiệp**.
