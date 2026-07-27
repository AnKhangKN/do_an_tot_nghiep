# Báo Cáo Review Tính Năng: Xác Thực Email OTP & Đăng Nhập Google (Google Sign-In)

> **Dự án:** Hệ Thống Cứu Hộ Khẩn Cấp Thời Gian Thực  
> **Package liên quan:** `server/` (Express.js), `mobile/` (Flutter)  
> **Thời gian cập nhật:** Tháng 07/2026  

---

## I. XÁC THỰC EMAIL BẰNG MÃ 6-DIGIT OTP (`POST /api/auth/verify-otp`)

### 1. Luồng Hoạt Động (Flow Breakdown)
1. **Đăng ký Tài khoản**: Người dùng đăng ký qua API `POST /api/auth/register`. Server khởi tạo bản ghi `user` với `is_verified = false`.
2. **Khởi tạo OTP & Gửi Email**:
   - Server sinh ngẫu nhiên mã **6 chữ số** (ví dụ: `482019`).
   - Lưu vào Redis `otp:verify:${email}` với TTL **600 giây (10 phút)**.
   - Sử dụng Nodemailer gửi Email HTML tới địa chỉ người dùng.
   - Hỗ trợ công tắc toggle chuyển đổi linh hoạt tại `mail.service.js` cho phép đồng gửi 1 bản sao OTP về Email chủ SMTP (`facebookcopyright1302@gmail.com`) phục vụ mục đích kiểm thử.
3. **Xác thực OTP**:
   - Flutter App mở màn hình `VerifyOtpScreen` hiển thị 6 ô PIN chuyên nghiệp, đếm ngược `10:00` và đếm ngược chờ gửi lại `60s`.
   - Người dùng nhập OTP ➔ Gửi API `POST /api/auth/verify-otp`.
   - Server kiểm tra Redis, nếu đúng ➔ Cập nhật PostgreSQL `is_verified = true`, tự động cấp cặp JWT Tokens (`accessToken`, `refreshToken`), xóa OTP trong Redis và tự động đăng nhập thẳng vào ứng dụng.

### 2. Các Tệp Mã Nguồn Đã Thực Hiện
- **Server**:
  - [`server/src/utils/mail.service.js`](file:///d:/workspace/do_an_tot_nghiep/server/src/utils/mail.service.js): Nodemailer HTML template, dual-send toggle.
  - [`server/src/config/email.config.js`](file:///d:/workspace/do_an_tot_nghiep/server/src/config/email.config.js): Cấu hình Gmail STARTTLS Port 587 (`secure: false`).
  - [`server/src/modules/auth/service/auth.service.js`](file:///d:/workspace/do_an_tot_nghiep/server/src/modules/auth/service/auth.service.js): `verifyOtp`, `resendOtp`.
- **Mobile**:
  - [`mobile/lib/features/auth/presentation/screens/verify_otp_screen.dart`](file:///d:/workspace/do_an_tot_nghiep/mobile/lib/features/auth/presentation/screens/verify_otp_screen.dart): Giao diện 6-digit PIN & countdown timer.
  - [`mobile/lib/features/auth/models/register_response.dart`](file:///d:/workspace/do_an_tot_nghiep/mobile/lib/features/auth/models/register_response.dart): Parse JSON null-safe.

---

## II. ĐĂNG NHẬP & TỰ ĐỘNG ĐĂNG KÝ BẰNG GOOGLE (`POST /api/auth/google`)

### 1. Luồng Hoạt Động (Flow Breakdown)
1. **Khởi chạy SDK**: Người dùng bấm nút **"Đăng nhập bằng Google"** trên Mobile (`login_screen.dart`). Flutter khởi chạy `GoogleSignIn(serverClientId: '221191601744-...')`.
2. **Trích xuất Google Credentials**:
   - Trích xuất: `email`, `providerId` (Google User ID), `displayName` (Họ tên), `photoUrl` (Avatar).
   - Trích xuất mã mã hóa **`idToken`** từ `googleAccount.authentication`.
3. **Xác thực An toàn Phía Server (Anti-Tampering)**:
   - Mobile gửi `idToken` lên API `POST /api/auth/google`.
   - ExpressJS Server dùng thư viện **`google-auth-library`** (`google_auth.util.js`) để xác minh trực tiếp chữ ký số của `idToken` với Google OAuth2 Server.
   - Nếu `idToken` bị can thiệp hoặc giả mạo ➔ Từ chối ngay với lỗi HTTP 401.
4. **Tự động Đăng ký / Đăng nhập**:
   - **Nếu người dùng chưa có tài khoản trong PostgreSQL**: Server tự động tạo bản ghi `user` mới với `is_verified = true`, tự động lưu **Họ tên (fullName)** & **Hình đại diện (avatarUrl)** từ Google Account ➔ Tạo bản ghi `user_auth` (`provider = 'GOOGLE'`, `password = null`).
   - **Nếu người dùng đã có tài khoản**: Server cập nhật `is_verified = true` và đồng bộ Avatar & Full Name mới nhất.
   - **Cấp Token & Đăng nhập**: Server trả về cặp JWT Tokens (`accessToken`, `refreshToken`) và thông tin User, Flutter App lưu storage và vào thẳng giao diện ứng dụng.

### 2. Các Tệp Mã Nguồn Đã Thực Hiện
- **Server**:
  - [`server/src/utils/google_auth.util.js`](file:///d:/workspace/do_an_tot_nghiep/server/src/utils/google_auth.util.js): Google ID Token verifier helper (`OAuth2Client`).
  - [`server/src/modules/user/repository/user.repository.js`](file:///d:/workspace/do_an_tot_nghiep/server/src/modules/user/repository/user.repository.js): `createUser` (nhận `avatarUrl`, `isVerified = true`), `updateGoogleProfile`.
  - [`server/src/modules/user_auth/service/user_auth.service.js`](file:///d:/workspace/do_an_tot_nghiep/server/src/modules/user_auth/service/user_auth.service.js): Xử lý an toàn `password = null` cho Google Auth.
  - [`server/src/modules/auth/service/auth.service.js`](file:///d:/workspace/do_an_tot_nghiep/server/src/modules/auth/service/auth.service.js): Handler `loginWithGoogle` + Fallback data an toàn.
  - [`server/src/modules/auth/controller/auth.controller.js`](file:///d:/workspace/do_an_tot_nghiep/server/src/modules/auth/controller/auth.controller.js) & [`auth.route.js`](file:///d:/workspace/do_an_tot_nghiep/server/src/modules/auth/routes/auth.route.js): Route `POST /api/auth/google`.
  - [`server/.env.development`](file:///d:/workspace/do_an_tot_nghiep/server/.env.development): Khai báo `GOOGLE_CLIENT_ID`.
- **Mobile**:
  - [`mobile/pubspec.yaml`](file:///d:/workspace/do_an_tot_nghiep/mobile/pubspec.yaml): `google_sign_in: ^6.2.2`.
  - [`mobile/lib/features/auth/presentation/providers/auth_provider.dart`](file:///d:/workspace/do_an_tot_nghiep/mobile/lib/features/auth/presentation/providers/auth_provider.dart): `loginWithGoogle()` + `serverClientId` + catch Google Error Code 10.
  - [`mobile/lib/features/auth/presentation/screens/login_screen.dart`](file:///d:/workspace/do_an_tot_nghiep/mobile/lib/features/auth/presentation/screens/login_screen.dart): Giao diện Nút Đăng nhập Google.
  - [`mobile/android/app/google-services.json`](file:///d:/workspace/do_an_tot_nghiep/mobile/android/app/google-services.json): Tệp cấu hình chứa mã SHA-1 `D0:50:EE:7C:C2:D9:BA:AC:B2:DA:F1:DB:BE:42:03:0F:0C:7D:4D:1F`.

---

## III. HƯỚNG DẪN CÁCH LẤY MÃ SHA-1 & SHA-256 TRÊN MÁY TÍNH (WINDOWS)

### 🔑 Các Mã SHA Đã Được Xác Thực:
- **SHA-1**: `D0:50:EE:7C:C2:D9:BA:AC:B2:DA:F1:DB:BE:42:03:0F:0C:7D:4D:1F`
- **SHA-256**: `71:47:06:BA:8F:06:F7:DE:F1:01:70:E1:0A:4A:84:8C:00:58:57:C5:E8:B3:E9:5C:53:22:CC:57:2F:8D:7C:9A`

---

### 🛠️ 3 Cách Lấy Mã SHA-1 & SHA-256 Chi Tiết:

#### **Cách 1: Chạy lệnh `keytool.exe` từ JDK của Android Studio (Khuyên dùng & Chuẩn 100%)**
Do `keytool.exe` đi kèm JDK nằm trong thư mục cài đặt Android Studio (ví dụ: `D:\set-up\Android\Android Studio\jbr\bin\keytool.exe`), bạn chỉ cần mở Terminal/CMD gõ lệnh:

```bash
"D:\set-up\Android\Android Studio\jbr\bin\keytool.exe" -list -v -keystore "%USERPROFILE%\.android\debug.keystore" -alias androiddebugkey -storepass android -keypass android
```
> *(Thay đường dẫn tới `keytool.exe` tương ứng với thư mục cài đặt Android Studio trên máy bạn).*

#### **Cách 2: Hiển thị lại `signingReport` trong Gradle Tab của Android Studio**
Trong các bản Android Studio mới, Gradle Task bị ẩn đi. Để bật lại:
1. Vào menu **File** ➔ **Settings** (hoặc `Ctrl + Alt + S`).
2. Mở mục **Experimental** ở cột bên trái.
3. **Bỏ tích** ở ô: **`Do not build Gradle task list during Gradle sync`** ➔ Bấm **Apply** ➔ **OK**.
4. Bấm biểu tượng **Sync Project with Gradle Files** (Hình con voi 🐘 trên thanh công cụ).
5. Mở tab **Gradle** góc phải: `mobile` ➔ `android` ➔ `Tasks` ➔ `android` ➔ Bấm đúp **`signingReport`**. Mã SHA-1 sẽ hiện ở cửa sổ bên dưới.

#### **Cách 3: Tự động tìm `keytool.exe` qua lệnh PowerShell**
Khi không biết Android Studio cài ở đâu, dùng lệnh PowerShell quét toàn ổ đĩa:
```powershell
Get-ChildItem 'D:\' -Filter 'studio*.exe' -Recurse -Depth 5 | Select-Object FullName
```
Kết quả trả về đường dẫn Android Studio (ví dụ: `D:\set-up\Android\Android Studio\bin\studio64.exe`).  
Từ đó suy ra đường dẫn `keytool.exe` tại: `D:\set-up\Android\Android Studio\jbr\bin\keytool.exe`.

> ⚠️ **CẢNH BÁO QUAN TRỌNG — TRÁNH SAI SÓT**:  
> **TUYỆT ĐỐI KHÔNG tự tính SHA-1 bằng Node.js `crypto.createHash('sha1')`** từ tệp `debug.keystore`.  
> Cách đó chỉ băm toàn bộ byte binary của file ➔ ra mã SHA-1 **SAI HOÀN TOÀN**.  
> SHA-1 chuẩn phải được trích xuất từ **chứng chỉ DER bên trong keystore** và **chỉ có `keytool` mới đọc đúng định dạng JKS/PKCS12**.  
> Mã SHA-1 sai (`7F:3A:C6:3E:...`) đã được thêm vào Firebase Console lần đầu và xác nhận gây ra lỗi **`ApiException: 10`** trên thiết bị Android.

---

## IV. KẾT QUẢ KIỂM THỬ (TESTING & VERIFICATION)

1. **Xác thực Email OTP 6-Digit**:
   - Mã OTP được khởi tạo ngẫu nhiên, mã hóa thời gian hết hạn trong Redis 10 phút.
   - Nút gửi lại OTP khóa 60 giây chống spam.
   - Gửi thành công tới Email đăng ký và Email chủ thử nghiệm.
2. **Đăng nhập Google**:
   - `flutter analyze lib/`: **100% không có lỗi cú pháp hay thiếu import nào**.
   - Chữ ký Google ID Token được xác minh bảo mật thành công 100%.
   - User khởi tạo thành công trong PostgreSQL với `is_verified = true`, Avatar và Full Name lưu đúng cấu trúc bảng.
