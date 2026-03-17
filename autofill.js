// ==============================================================
// TOOL ĐIỀN FORM TỰ ĐỘNG DÀNH RIÊNG CHO BOSS TEST WEB
// ==============================================================

function autoFillAdminForm() {
    // Hàm rút gọn để điền dữ liệu vào ô
    const setVal = (id, val) => { 
        const el = document.getElementById(id);
        if(el) el.value = val; 
    };
    
    // Tạo data ngẫu nhiên cho khỏi trùng lặp
    const randomNum = Math.floor(Math.random() * 1000);
    
    setVal('adTitle', 'Siêu Phẩm Test Tự Động #' + randomNum);
    setVal('adAuthor', 'NeonVH Auto');
    setVal('adTeam', 'Team AI VN');
    setVal('adVersion', 'v2.0.5');
    setVal('adProgress', '100% (Hoàn thành)');
    setVal('adPlatform', 'Android / PC');
    setVal('adTransType', 'Dev + AI Edit Mượt');
    setVal('adSize', '2.4 GB');
    setVal('adGenre', '18+, Harem, Romance, Visual Novel, NTR');
    setVal('adDesc', 'Đây là nội dung tóm tắt được công cụ Auto-Fill điền tự động. Cốt truyện game cực kỳ lôi cuốn, đồ họa đỉnh cao, anh em tải về trải nghiệm ngay nhé!');
    setVal('adCoverUrl', 'https://i.imgur.com/8N4N89n.png');
    setVal('adScreenshotsUrl', 'https://i.imgur.com/8N4N89n.png\nhttps://i.imgur.com/8N4N89n.png');
    setVal('adLinkAndTerabox', 'https://terabox.com/s/link-android-test');
    setVal('adLinkPcDrive', 'https://drive.google.com/file/d/link-pc-test');
    setVal('adMsg', 'Chúc anh em chơi game vui vẻ!');
    
    // Tích tự động vào ô 18+
    const checkbox18 = document.getElementById('ad18');
    if(checkbox18) checkbox18.checked = true;
    
    // Bắn thông báo xanh xịn xò
    if(typeof showToast === 'function') {
        showToast("🤖 Đã điền tự động Form Đăng Game!");
    } else {
        alert("🤖 Đã điền tự động xong!");
    }
}

// Tự động tạo một nút bấm lơ lửng góc dưới bên trái màn hình
window.addEventListener('load', () => {
    const btn = document.createElement('button');
    btn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles mr-2"></i> ĐIỀN NHANH';
    btn.className = 'fixed bottom-5 left-5 z-[999999] bg-gradient-to-r from-green-500 to-emerald-600 text-white font-black px-5 py-3 rounded-xl shadow-[0_0_20px_#22c55e] hover:scale-105 transition-transform border border-white/20';
    btn.onclick = autoFillAdminForm;
    
    // Chỉ hiện nút khi đại ca mở khu vực Admin, tắt khi ở trang chủ cho đỡ vướng
    setInterval(() => {
        const adminView = document.getElementById('adminView');
        if (adminView && adminView.classList.contains('view-active')) {
            btn.style.display = 'block';
        } else {
            btn.style.display = 'none';
        }
    }, 500);

    document.body.appendChild(btn);
});
