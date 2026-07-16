Hardware acceleration trong VSCode là cơ chế để **dùng GPU của máy** thay vì chỉ dùng CPU để vẽ giao diện.

### Hiểu đơn giản

Khi bật hardware acceleration:

- VSCode dùng **GPU** để render:
  - cửa sổ
  - scroll
  - terminal panel
  - tab/file tree
  - animation giao diện

Khi tắt:

- VSCode sẽ render chủ yếu bằng **CPU**
- có thể ổn hơn nếu driver GPU / compositor bị lỗi
- nhưng đôi khi sẽ kém mượt hơn nếu máy yếu

### Vì sao nó liên quan đến lag của bạn

Triệu chứng bạn mô tả:

- kéo terminal lên/xuống bị giật
- mở file bị giật
- gõ code vẫn bình thường

=> đây rất giống lỗi **render giao diện**, mà hardware acceleration là phần liên quan trực tiếp nhất.

### Cách tắt trong VSCode

1. Mở **Command Palette**
   - `Ctrl + Shift + P`
2. Gõ:
   - `Preferences: Configure Runtime Arguments`
3. Nó mở file `argv.json`
4. Thêm:

```json
{
  "disable-hardware-acceleration": true
}
```

5. Lưu lại
6. **Restart VSCode**

### Nếu muốn bật lại

Xóa dòng:

```json
"disable-hardware-acceleration": true
```

rồi restart lại VSCode.

### Nếu không muốn sửa file thủ công

Bạn có thể:

- mở VSCode
- vào **Help**
- tìm mục liên quan đến **Toggle Hardware Acceleration** hoặc cấu hình runtime arguments

Nhưng cách chắc chắn nhất trên Windows là sửa `argv.json` như trên.

### Kiểm tra sau khi tắt

Sau khi tắt hardware acceleration:

- nếu scroll/drag/open file mượt hơn rõ rệt → đúng bệnh
- nếu vẫn lag → chuyển sang nghi ngờ extension hoặc VSCode profile/cache

Kết luận: hardware acceleration là **cơ chế tăng tốc đồ họa bằng GPU**, và trong trường hợp của bạn đây là thứ nên thử đầu tiên.
