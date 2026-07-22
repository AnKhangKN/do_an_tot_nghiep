---
name: bug_hunter_expert
description: Trigger khi: Sửa bug, khắc phục lỗi hệ thống, gặp ngoại lệ hoặc crash. Hướng dẫn AI không chỉ vá lỗi bề nổi (symptom patch) mà phải tìm nguyên nhân gốc rễ (Root Cause), lỗi tương tự (Similar bugs), lỗi tiềm ẩn (Hidden bugs) và tác dụng phụ (Side effects).
---

# Thợ Săn Lỗi & Phân Tích Sự Cố Toàn Diện (Bug Hunter) ⭐⭐⭐⭐⭐

Kỹ năng này bắt buộc AI phải thực hiện điều tra sự cố theo chiều sâu, truy vết tận gốc nguyên nhân và dự đoán trước các rủi ro thay vì chỉ vá lỗi tạm thời ở bề nổi.

---

## 🚫 Cấm Vá Lỗi Bề Nổi (No Superficial Symptom Patches)
- Nghiêm cấm việc nuốt ngoại lệ (silent catch), gán fallback rỗng, hoặc xoá các assertion/test để che đậy lỗi mà không giải quyết vấn đề cốt lõi.

---

## 🔍 Quy trình Thợ Săn Lỗi (Bug Hunting Protocol)

Khi tiếp nhận bất kỳ một bug nào, AI bắt buộc phải điều tra và giải thích 4 yếu tố sau:

### 1. Nguyên nhân Gốc rễ (Root Cause)
- Giải thích chính xác **tại sao** lỗi lại xảy ra ở mức hệ thống (mất đồng bộ trạng thái, bất đồng bộ bất ngờ, thiếu validation, lệch kiểu dữ liệu hay bất đồng bộ DB).

### 2. Các Lỗi Tương Tự (Similar Bugs)
- Sử dụng `grep_search` quét toàn bộ dự án để kiểm tra xem đoạn pattern bị lỗi đó có đang tồn tại ở các module hoặc file khác hay không. Sửa triệt để tất cả các nơi bị ảnh hưởng.

### 3. Các Lỗi Tiềm Ẩn (Hidden Bugs)
- Kiểm tra các trường hợp biên (Edge cases): Null/Undefined pointer, mạng chập chờn (timeout), rò rỉ bộ nhớ (memory leaks), race condition giữa các yêu cầu bất đồng bộ.

### 4. Tác Dụng Phụ (Side Effects)
- Đánh giá xem việc sửa bug này có làm ảnh hưởng hoặc làm hỏng chức năng nào khác đang chạy hay không. Đảm bảo giữ nguyên API contract và tính nhất quán dữ liệu.

---

## 📝 Báo cáo Kết quả Săn Lỗi
Mỗi khi sửa xong bug, AI trình bày tóm tắt:
1. **Root Cause**: Nguyên nhân cốt lõi gây ra lỗi.
2. **Fix Implemented**: Cách thức sửa đổi chi tiết.
3. **Similar / Hidden Bugs Checked**: Danh sách các nơi đã rà soát thêm.
4. **Side Effects Verification**: Xác nhận không gây ra tác dụng phụ.
