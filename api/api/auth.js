const crypto = require('crypto');

// Băm pass ra mã Hex để không ai đọc được Pass thật (Kể cả bị lộ Database)
const hashPassword = (str) => crypto.createHash('sha256').update(str).digest('hex');

// Tạo Token giả lập bảo mật phiên đăng nhập
const generateToken = (user, role) => Buffer.from(`${user}:${role}:${Date.now()}`).toString('base64');

// Đây là mã Hash bảo mật của: "Admin" + "Admin123"
const ADMIN_HASH = "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918"; 

export default async function handler(req, res) {
    // Cấu hình CORS để cho phép Web của đại ca gọi API này
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    // Nếu trình duyệt gửi ping thăm dò (OPTIONS), cho phép qua luôn
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Chỉ nhận dữ liệu dạng POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Chỉ hỗ trợ phương thức POST" });
    }

    const { u, p, action } = req.body;

    // Validate Input
    if (!u || !p || u.length > 50 || p.length > 50) {
        return res.status(400).json({ error: "Dữ liệu không hợp lệ hoặc quá dài!" });
    }

    // XỬ LÝ ADMIN: Kiểm tra mã Hash thay vì check text thường
    const secureHash = hashPassword(u + p);
    if (secureHash === ADMIN_HASH) {
        const token = generateToken("Admin", "admin_supreme");
        return res.status(200).json({ success: true, token: token, roleHash: "adm_x99" });
    }

    // XỬ LÝ NGƯỜI CHƠI THƯỜNG: Băm nát mật khẩu rồi trả về cho Frontend tự lưu lên Firebase
    const userHashedPass = hashPassword(p);
    
    if (action === 'register') {
        return res.status(200).json({ success: true, hashedPass: userHashedPass });
    } else { // Login
        const token = generateToken(u, "user");
        return res.status(200).json({ success: true, token: token, hashedPass: userHashedPass });
    }
}
