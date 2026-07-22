---
name: codegraph_navigator_expert
description: Trigger khi: Tìm kiếm hàm, class, type, truy vết luồng gọi code (Call Graph), tìm điểm định vị file hoặc hiểu kiến trúc khi dự án có thư mục .codegraph. Hướng dẫn AI ưu tiên dùng CodeGraph thay cho grep/find.
---

# Hướng Dẫn Sử Dụng CodeGraph Định Vị Mã Nguồn (CodeGraph Navigator) ⭐⭐⭐⭐⭐

Kỹ năng này hướng dẫn AI tận dụng chỉ mục CodeGraph sẵn có (`.codegraph/`) để truy vết mã nguồn, luồng gọi hàm và cấu trúc lớp một cách siêu tốc và chính xác.

---

## ⚡ Nguyên tắc Ưu Tiên (Priority Rule)
- Khi thư mục `.codegraph/` tồn tại ở root của dự án, AI **BẮT BUỘC ưu tiên sử dụng CodeGraph** trước khi dùng `grep_search` hoặc `view_file` từng file đơn lẻ.

---

## 🚀 Vì Sao CodeGraph Mạnh Hơn Grep/Find Thường?
1. **Trích xuất Verbatim Source**: Trả về chính xác từng dòng mã nguồn có gắn số dòng của hàm/class cần tìm trong một câu lệnh duy nhất.
2. **Truy vết Luồng gọi (Call Paths & Dynamic Dispatch)**: Tự động phân tích và hiển thị các hàm gọi đến (Callers) và các hàm được gọi đi (Callees), kể cả các hàm kế thừa hoặc dynamic dispatch mà `grep` thông thường không thể tìm ra.
3. **Hiểu Ngữ Cảnh Kiến Trúc**: Cho phép hỏi trực tiếp câu hỏi bằng ngôn ngữ tự nhiên (ví dụ: `codegraph explore "luồng xử lý cancelSOS"`).

---

## 🛠️ Cách Thức Sử Dụng CodeGraph trong AI

### 1. Sử dụng MCP Tool `codegraph_explore` (Ưu tiên số 1)
Gọi tool lazy `call_mcp_tool`:
- **ServerName**: `codegraph`
- **ToolName**: `codegraph_explore`
- **Arguments**: `{ "query": "<tên symbol hoặc câu hỏi cần tra cứu>" }`

### 2. Sử dụng Terminal Command (Trường hợp cần xem trực tiếp trên Terminal)
Chạy lệnh terminal:
`codegraph explore "<tên_hàm_hoặc_câu_hỏi>"`

---

## 💡 Ví Dụ Tra Cứu Hiệu Quả
- Tìm định nghĩa & luồng hàm `cancelSOS`: `query: "cancelSOS"`
- Tìm luồng xử lý Socket nhận ca cứu hộ: `query: "rescue:accept"`
- Tìm cấu trúc Provider xử lý bản đồ Victim: `query: "VictimMapProvider"`
