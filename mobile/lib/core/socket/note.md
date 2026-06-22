1. Nhận event realtime để update UI

Ví dụ:

- có SOS mới gửi tới rescuer
- SOS bị huỷ
- SOS đã được người khác nhận rồi
trạng thái case thay đổi

2. Hiển thị realtime tracking

Frontend không tính logic vị trí, chỉ:

- nhận vị trí rescuer
- render lên map
- animate marker

3. Gửi dữ liệu đơn giản lên backend

Frontend chỉ gửi “input thô”:

- rescuer online
- location update
- accept SOS
- cancel SOS