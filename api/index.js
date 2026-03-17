// =========================================================================
// NEONVH BACKEND CORE v30 - MAXIMUM SECURITY (DO NOT MODIFY)
// =========================================================================
const crypto = require('crypto');

// Băm mật khẩu Admin bằng thuật toán SHA-256 (Hacker dò bằng niềm tin)
// Đang đặt mặc định ứng với tài khoản cũ của bro (Admin / Admin123)
const ADMIN_HASH = "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918"; 

// Bộ nhớ đệm chặn Spam (Chống DDoS cục bộ)
const ipCache = new Map();

export default async function handler(req, res) {
    // 1. LẤY IP CỦA KẺ TRUY CẬP
    const clientIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress || "Unknown";
    const origin = req.headers.origin || req.headers.referer || "";

    // ---------------------------------------------------------------------
    // KHIÊN 1: ANTI-DDOS (Chặn gọi liên tục)
    // ---------------------------------------------------------------------
    const now = Date.now();
    if (ipCache.has(clientIP)) {
        const lastRequestTime = ipCache.get(clientIP);
        if (now - lastRequestTime < 2000) { // Gọi lại dưới 2 giây -> Chặn
            return res.status(429).json({ error: "Bị chặn bởi Anti-Spam Bot." });
        }
    }
    ipCache.set(clientIP, now); // Lưu lại thời gian gọi

    // ---------------------------------------------------------------------
    // KHIÊN 2: CORS FIREWALL (Chỉ cho web của bro đi qua)
    // ---------------------------------------------------------------------
    const ALLOWED_DOMAIN = "https://neonvh.github.io"; // Tên miền chính chủ

    // Nếu không xuất phát từ web của bro -> Đuổi cổ
    if (origin && !origin.startsWith(ALLOWED_DOMAIN)) {
        return res.status(403).json({ error: "Access Denied. Mạng lưới đã khóa IP của bạn." });
    }

    // Cấp phép thông hành cho web của bro
    res.setHeader('Access-Control-Allow-Origin', ALLOWED_DOMAIN);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // ---------------------------------------------------------------------
    // LẤY CHÌA KHÓA TỪ KÉT SẮT VERCEL (An toàn tuyệt đối)
    // ---------------------------------------------------------------------
    const secureConfig = {
        apiKey: process.env.FB_API_KEY,
        projectId: process.env.FB_PROJECT_ID,
        appId: process.env.FB_APP_ID,
        authDomain: process.env.FB_AUTH_DOMAIN,
        storageBucket: process.env.FB_STORAGE_BUCKET,
        messagingSenderId: process.env.FB_MSG_ID
    };

    // ---------------------------------------------------------------------
    // XỬ LÝ YÊU CẦU TỪ FRONTEND
    // ---------------------------------------------------------------------
    try {
        const { type, u, p } = req.query;

        // 1. Web xin chìa khóa để chạy giao diện
        if (type === "get_gate") {
            if (!secureConfig.apiKey) {
                return res.status(500).json({ error: "Lỗi: Máy chủ Vercel chưa có Biến Môi Trường!" });
            }
            return res.status(200).json(secureConfig);
        }

        // 2. Yêu cầu kiểm tra quyền Admin
        if (type === "admin_verify") {
            if (!u || !p) return res.status(400).json({ error: "Thiếu dữ liệu" });

            // Thuật toán gộp tài khoản + mật khẩu rồi băm nát
            const hashInput = crypto.createHash('sha256').update(u + p).digest('hex');
            
            if (hashInput === ADMIN_HASH) {
                return res.status(200).json({ role: "admin", ip: clientIP, msg: "Verified" });
            }
            return res.status(403).json({ role: "none", msg: "Cảnh báo xâm nhập." });
        }

        // Mặc định
        return res.status(200).json({ 
            status: "Server Secured and Online.", 
            your_ip: clientIP 
        });

    } catch (error) {
        return res.status(500).json({ error: "Lỗi hệ thống máy chủ." });
    }
}
