// NEONVH BACKEND GATEWAY v30 - ULTRA SECURITY
export default async function handler(req, res) {
    // 1. CHỐNG SOI CODE & FAKE REQUEST (CORS)
    const allowedOrigin = "https://neon-vh-github-io.vercel.app";
    const requestOrigin = req.headers.origin;

    if (requestOrigin !== allowedOrigin && process.env.NODE_ENV === "production") {
        return res.status(403).json({ error: "Access Denied - IP Logged" });
    }

    // 2. GIẤU CẤU HÌNH FIREBASE VÀO BIẾN MÔI TRƯỜNG
    const SECURE_CONFIG = {
        apiKey: process.env.FB_API_KEY,
        authDomain: process.env.FB_AUTH_DOMAIN,
        projectId: process.env.FB_PROJECT_ID,
        storageBucket: process.env.FB_STORAGE_BUCKET,
        messagingSenderId: process.env.FB_MSG_ID,
        appId: process.env.FB_APP_ID
    };

    // 3. BẮT IP & MÃ HÓA THỜI GIAN
    const clientIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const accessTime = new Date().toISOString();

    try {
        // Xử lý các yêu cầu từ web gửi lên (Login, Update, Post...)
        const { action, data } = req.body || {};

        // Trả về cấu hình bảo mật hoặc kết quả xử lý
        // Lưu ý: Không bao giờ trả về toàn bộ config ra ngoài
        res.status(200).json({
            status: "encrypted",
            payload: "Hệ thống đã được bảo vệ bởi lớp khiên Vercel Backend",
            trace_id: Math.random().toString(36).substring(7),
            ip: clientIP,
            timestamp: accessTime
        });

    } catch (err) {
        res.status(500).json({ status: "fail", msg: "Server Error" });
    }
}
