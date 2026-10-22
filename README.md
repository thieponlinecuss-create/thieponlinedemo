# Duyên Thư - Thiệp cưới online (bản web tĩnh cho GitHub Pages)

Bản này chuyển từ Next.js + SQLite sang **web tĩnh** (HTML/CSS/JS thuần, không cần build) để up lên GitHub Pages.
GitHub Pages không chạy được server, nên phần dữ liệu được chuyển sang **Google Apps Script + Google Sheets + Google Drive** (miễn phí).

Các chức năng giữ nguyên: thư viện 8 mẫu thiệp + demo, đăng ký/đăng nhập, tạo/chỉnh sửa thiệp có xem trước, tải ảnh (ảnh bìa, ảnh cô dâu chú rể, album 12 ảnh), link riêng cho từng khách, RSVP + lời chúc, đếm ngược, bản đồ, nhạc nền, hộp mừng cưới, thanh toán VietQR + admin xác nhận, thời gian dùng thử 3 ngày / kích hoạt 365 ngày.

## Cấu trúc

```
index.html        Website chính (trang chủ, mẫu, bảng giá, đăng nhập, quản lý, admin)
t.html            Trang thiệp công khai gửi cho khách: t.html?s=<slug>&k=<mã khách>
css/              site.css (website) + invitation.css (thiệp)
js/config.js      CẤU HÌNH: URL backend, giá, tài khoản nhận tiền
js/*.js           Mã nguồn giao diện
apps-script/Code.gs   Backend (dán vào Google Apps Script, KHÔNG up lên GitHub cũng được)
.nojekyll         Báo GitHub Pages không xử lý Jekyll
```

## Cài đặt (làm 1 lần, khoảng 10 phút)

### Bước 1. Tạo Google Sheet làm database
1. Vào https://sheets.google.com, tạo một bảng tính trống, đặt tên `DuyenThu-DB`.
2. **Không chia sẻ** bảng tính này cho ai (trong đó có thông tin người dùng).

### Bước 2. Dán backend vào Apps Script
1. Trong Sheet: menu **Tiện ích mở rộng → Apps Script**.
2. Xoá nội dung mặc định, dán toàn bộ nội dung file `apps-script/Code.gs`.
3. Sửa dòng đầu: `const ADMIN_EMAIL = 'you@example.com';` thành email của bạn (email này sẽ có quyền vào trang Admin). Nếu đổi giá thì sửa `PRICE` cho khớp `js/config.js`.
4. Chọn hàm **`setup`** ở thanh trên, bấm **Chạy**, rồi cấp quyền khi Google hỏi (cần quyền Sheets và Drive để lưu ảnh). Hàm này tạo sẵn các sheet và thư mục `DuyenThu-Uploads` trong Drive.

### Bước 3. Triển khai Web App và lấy URL
1. Bấm **Triển khai → Tùy chọn triển khai mới → loại "Ứng dụng web"**.
2. **Thực thi với tư cách:** Tôi. **Người có quyền truy cập:** **Bất kỳ ai**.
3. Bấm Triển khai, sao chép **URL ứng dụng web** (dạng `https://script.google.com/macros/s/.../exec`).
4. Mở `js/config.js`, dán URL vào `API_URL`, đồng thời sửa `BANK_ID`, `BANK_ACCOUNT`, `BANK_HOLDER` thành tài khoản nhận tiền thật.

> Mỗi lần sửa `Code.gs` sau này, phải **Triển khai → Quản lý bản triển khai → biểu tượng bút chì → Phiên bản mới → Triển khai** thì thay đổi mới có hiệu lực (URL giữ nguyên).

### Bước 4. Up lên GitHub Pages
1. Tạo repository mới trên GitHub (ví dụ `thiep-cuoi`).
2. Upload toàn bộ file: `index.html`, `t.html`, thư mục `css`, `js`, file `.nojekyll` (và `README.md`; thư mục `apps-script` up hay không đều được).
3. Vào **Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: `main` / `(root)` → Save**.
4. Sau 1-2 phút web chạy tại `https://<tên-github>.github.io/thiep-cuoi/`.
   Dùng tên miền riêng thì thêm ở mục *Custom domain* của Pages.

### Bước 5. Kiểm tra
1. Mở web, **đăng ký tài khoản bằng đúng email `ADMIN_EMAIL` trước tiên** (tránh người khác đăng ký email đó trước bạn).
2. Tạo thử một thiệp → thêm khách mời → mở link riêng của khách → gửi RSVP → xem lại ở tab Phản hồi.
3. Tab Thanh toán → tạo yêu cầu → vào menu **Admin** để Xác nhận.

## Khác biệt so với bản Next.js (cần biết)

- **Link thiệp** có dạng `.../t.html?s=ten-co-dau-chu-re-ab12` và link khách `...&k=<mã>` (bản cũ là `/t/<slug>?k=`). Link bản cũ không dùng lại được.
- **Dữ liệu cũ** trong SQLite không tự chuyển sang. Nếu đã có người dùng thật, hãy báo mình để viết script nhập dữ liệu vào Sheet.
- **Tốc độ**: mỗi thao tác gọi Apps Script mất khoảng 1-2 giây (lần đầu sau thời gian dài không dùng có thể chậm hơn). Thiệp đã mở sẽ chạy mượt.
- **Mật khẩu**: bản cũ dùng bcrypt; Apps Script không có bcrypt nên dùng SHA-256 lặp 1000 lần kèm salt riêng cho từng tài khoản. Vẫn không lưu mật khẩu gốc, nhưng yếu hơn bcrypt, nên đừng dùng chung mật khẩu với dịch vụ khác cho tài khoản Admin.
- **Giới hạn thử sai**: Apps Script không thấy địa chỉ IP, nên giới hạn đăng nhập sai tính theo từng email, giới hạn RSVP tính theo từng thiệp (và từng tên người gửi).
- **Ảnh** lưu ở Google Drive (thư mục `DuyenThu-Uploads`, chia sẻ dạng "ai có link"), tự thu nhỏ còn tối đa 1600px trước khi tải lên, tối đa 6MB/ảnh.
- **Chia sẻ link trên Zalo/Facebook** sẽ không hiện ảnh xem trước riêng cho từng thiệp (web tĩnh không tạo được thẻ OpenGraph theo từng thiệp).
- **Hạn mức Google**: tài khoản Gmail thường chạy tốt cho vài trăm thiệp. Nếu lượng khách rất lớn, nên chuyển sang backend riêng.
- Thêm một thay đổi nhỏ: nút **Xoá thiệp** có hộp xác nhận trước khi xoá.
- Giá, số ngày dùng thử và số ngày kích hoạt nằm ở **hai nơi**: `js/config.js` (hiển thị) và đầu `Code.gs` (tính toán thật). Sửa thì sửa cả hai.

## Thêm mẫu thiệp mới
Thêm một phần tử vào mảng `TEMPLATES` trong `js/lib.js` (bộ màu `vars` mới), và thêm `id` đó vào mảng `TEMPLATE_IDS` ở đầu `apps-script/Code.gs` (rồi triển khai lại phiên bản mới).
