# ❄️ MÉO TIN SHOW - Ice Poster Studio (Trình Tạo Poster Nghệ Sĩ Băng Tuyết)

Ứng dụng web chuyên dụng tạo poster nghệ sĩ chuẩn chủ đề hang băng tuyết cho sự kiện **MÉO TIN SHOW** với kiến trúc **5 lớp (Layer Stack)** chính xác trên HTML5 Canvas.

---

## 🚀 Cách Chạy Ứng Dụng

### Cách 1: Chạy Server Tự Động (Khuyên Dùng)
Nhấp đúp chuột vào file:
```
start_app.bat
```
Server cục bộ sẽ tự khởi động tại `http://localhost:8080` (hoặc cổng trống) và tự động mở trình duyệt mặc định của bạn. Chạy qua server giúp AI WebAssembly (@imgly/background-removal) hoạt động với hiệu năng tối đa.

### Cách 2: Mở Trực Tiếp File HTML
Nhấp đúp chuột mở file `index.html` bằng trình duyệt Chrome, Edge hoặc Firefox.

---

## 🎨 Cấu Trúc 5 Lớp (Layer Stack) Trên Canvas

1. **Layer 1 (Background):**
   - Nền hang băng gốc với chữ *"MÉO TIN SHOW"*, khung viền băng tuyết và ngày *"19.12"*.
   - **Tối ưu đặc biệt:** Cung cấp bản **Nền sạch** đã tách bỏ vương miện tĩnh ở giữa để khi đưa nghệ sĩ vào không bị che hoặc lộ vết đè, vương miện được chuyển động linh hoạt lên đỉnh chữ tên nghệ sĩ.

2. **Layer 2 (Back Glow & Mảnh Băng Sau Lưng):**
   - Dùng chính hình dáng (alpha mask) của nghệ sĩ sau khi tách nền, phóng to nhẹ (1.06x), tô màu xanh băng neon (`#00d2ff`), làm mờ `filter = blur(25px)` với chế độ hòa trộn `screen` để tạo hào quang xanh phát sáng rực rỡ quanh viền áo và tóc.

3. **Layer 3 (Nhân Vật Đã Xóa Nền):**
   - Áp dụng **Gradient Mask** mờ dần từ phần đùi xuống bụng (`destination-out`) để chân nhân vật chìm tự nhiên vào lớp băng phía dưới thay vì bị cắt ngang cứng nhắc.
   - **Color Grading:** Tăng tương phản (`contrast(115%)`), cân bằng độ sáng và phủ ám sắc xanh lạnh (`#00d2ff` overlay) vào vùng bóng tối để tiệp hoàn toàn với ánh sáng hang băng.

4. **Layer 4 (Chữ Tên Nghệ Sĩ - "DAM ON" & Icon Vương Miện):**
   - **Font gai băng nhũ đá chảy:** Tích hợp font **CF Jack Story** và **Ice Cold** (nhúng trực tiếp base64 trong CSS không lo lỗi mạng).
   - **Góc nghiêng:** Tự động nghiêng `-8°` chuẩn phong cách poster.
   - **Chất liệu băng (Ice Texture):** Dùng `ctx.globalCompositeOperation = 'source-in'` lồng bề mặt tinh thể băng nứt vào bên trong ruột chữ, kèm dải màu frost gradient đa tầng.
   - **Viền 3D & Hào quang:** Đổ bóng phát sáng cyan neon (`shadowBlur = 22px`, `#00f0ff`) kèm viền ngoài dày và viền sáng bạc trắng bên trong.
   - **Vương miện:** Gắn trên đỉnh chữ cái giữa, nghiêng đồng bộ `-8°` và phát quang xanh.

5. **Layer 5 (Foreground Overlay):**
   - **Tia sáng 4 cánh (Sparkles):** Các ngôi sao phát sáng 4 tia nhũ kim đặt tại các góc nhọn của chữ và đỉnh vương miện. Cho phép click đúp chuột trực tiếp trên canvas để gắn thêm sao tại bất kỳ vị trí nào.
   - **Sương khói băng (Ice Fog Mist):** Lớp sương mù bề mặt cuộn trôi ở đáy hang băng làm dịu phần chân và chữ.
   - **Bụi tuyết / Tinh thể băng bay (Floating Crystals):** Các hạt phản chiếu ánh sáng trôi lơ lửng trong không khí.

---

## 🛠️ Tính Năng Kỹ Thuật

- **Tự động xóa nền AI (In-Browser WebAssembly/WebGL):** Tích hợp thư viện `@imgly/background-removal`, hoàn toàn miễn phí, không giới hạn lượt dùng và chạy trực tiếp trong trình duyệt.
- **Dự phòng thông minh (Fallback Keying):** Hỗ trợ khử phông đơn sắc (Color Keying), tải ảnh PNG đã tách sẵn, hoặc chọn ngay các mẫu nghệ sĩ có sẵn (DAM ON, ca sĩ nam hoodie, performer nữ).
- **Tương tác trực tiếp trên Canvas:** Dùng chuột kéo thả trực tiếp để di chuyển Nhân vật, Chữ nghệ sĩ hoặc các Ngôi sao lấp lánh.
- **Xuất file ảnh nét căng (Export High-Res PNG):** Hỗ trợ xuất 1x (512x382), 2x HD (1024x764) và 4x UHD (2048x1528) để đăng bài mạng xã hội không bị vỡ hạt.
- **So sánh trực quan (Compare View):** Bấm nút "So sánh mẫu DAM ON" để đặt poster hiện tại cạnh mẫu thiết kế chuẩn kiểm tra độ khớp từng chi tiết.
