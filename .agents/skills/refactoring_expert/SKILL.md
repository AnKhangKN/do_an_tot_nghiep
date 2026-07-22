---
name: refactoring_expert
description: Trigger khi: Sau khi hoàn thành một tính năng, khi refactor mã nguồn hoặc tối ưu chất lượng code. Hướng dẫn AI tự rà soát mã trùng lặp, tách hàm nhỏ gọn, tối ưu tên biến và đơn giản hóa thiết kế.
---

# Chuyên Gia Tối Ưu & Tái Cấu Trúc Mã Nguồn (Refactoring Expert) ⭐⭐⭐⭐⭐

Kỹ năng này hướng dẫn AI tự động đánh giá và tinh chỉnh lại đoạn code vừa viết nhằm đảm bảo tính sạch sẽ, dễ đọc, dễ bảo trì và hiệu năng cao nhất.

---

## 🔍 Checklist Tự Rà Soát Sau Khi Viết Code (Post-Implementation Self-Review)

Ngay sau khi cài đặt thành công một tính năng hoặc sửa lỗi, AI sẽ tự đặt 4 câu hỏi:

1. **Có mã nguồn bị trùng lặp không? (Less Duplication)**
   - Kiểm tra xem đoạn logic vừa viết có bị lặp lại ở nơi khác không. Nếu có, tách ra helper function hoặc custom hook / shared widget.

2. **Hàm có bị quá dài không? (Smaller Functions)**
   - Mỗi hàm nên làm một việc duy nhất và ngắn gọn (dưới 30 - 40 dòng). Tách các khối logic phức tạp thành các helper method riêng biệt có tên gọi rõ nghĩa.

3. **Class hoặc File có quá cồng kềnh không?**
   - Tách bớt các component UI nhỏ (Sub-widgets), tách bớt các helper logic ra ngoài file chính.

4. **Tên biến / Tên hàm đã đủ rõ nghĩa chưa? (Better Naming)**
   - Tên biến phải nói lên mục đích sử dụng (ví dụ: thay `data` bằng `activeSosRequest`, thay `flag` bằng `isSearchingRescuer`).

---

## 💡 Các Đề Xuất Tải Cấu Trúc (Refactoring Suggestions)

Nếu phát hiện dư thừa hoặc thiếu tối ưu, AI đề xuất tóm tắt:
- **Better Naming**: Các biến/hàm được đổi tên rõ nghĩa hơn.
- **Smaller Functions**: Các hàm được tách nhỏ.
- **Less Duplication**: Đoạn code trùng lặp được tái sử dụng.
- **Simpler Design**: Thiết kế đơn giản hóa, loại bỏ các đoạn code rác không sử dụng.
