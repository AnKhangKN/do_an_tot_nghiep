---
name: strict_clarification_assistance
description: Trigger khi: Yêu cầu của người dùng chưa rõ ràng, lỗi thiếu log traceback, hoặc cần xác nhận quyết định thiết kế. Hướng dẫn AI tuyệt đối KHÔNG ĐOÁN MÒ mà phải chủ động tra cứu log/mã nguồn thực tế hoặc hỏi lại người dùng.
---

# Quy tắc Không đoán mò & Chủ động Hỏi lại (Strict Clarification & No Guessing)

Kỹ năng này bắt buộc AI phải duy trì tính chính xác, không tự ý đưa ra các giả định mơ hồ khi thiếu bằng chứng hoặc thiếu thông tin yêu cầu.

---

## 1. Nguyên tắc "Không bao giờ đoán mò" (Never Guess)
- **Không đoán nguyên nhân gây lỗi**: Khi một hàm, API hay giao diện bị lỗi, AI không được tự ý sửa code dựa trên suy đoán chủ quan. Bắt buộc phải:
  1. Đọc file log traceback hoặc kiểm tra mã nguồn thực tế trước.
  2. Nếu thiếu log, yêu cầu người dùng cung cấp log hoặc thêm `console.log` / `debugPrint` để lấy log thực tế trước khi kết luận.
- **Không đoán tên biến, file path hay schema**: Bắt buộc dùng `grep_search` hoặc `view_file` để kiểm tra tên biến, tên hàm, bảng CSDL thực tế thay vì tự suy đoán.

---

## 2. Chủ động Hỏi lại Người dùng khi Chưa rõ Yêu cầu
AI bắt buộc phải dừng lại và đặt câu hỏi làm rõ đối với các trường hợp:
- **Yêu cầu bị thiếu ngữ cảnh**: Người dùng yêu cầu sửa một tính năng nhưng không nói rõ ở màn hình nào (Victim hay Rescuer), role nào (User, Admin, Rescuer), hoặc môi trường nào.
- **Có nhiều phương án thiết kế**: Khi một tính năng có nhiều hướng triển khai khác nhau, AI phải nêu tóm tắt các phương án và hỏi ý kiến người dùng trước khi viết code.
- **Thay đổi nguy hiểm**: Khi sửa đổi các hàm dùng chung (Core / Shared) hoặc API contract ảnh hưởng đến nhiều nơi.

---

## 3. Cách thức đặt câu hỏi làm rõ
- **Ngắn gọn, đi thẳng vào trọng tâm**: Đặt câu hỏi trực tiếp, ngắn gọn bằng Tiếng Việt.
- **Liệt kê các lựa chọn rõ ràng**: Nếu có các tùy chọn, đánh số hoặc dùng bullet point để người dùng dễ chọn (ví dụ: Tùy chọn A vs Tùy chọn B).
