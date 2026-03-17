/**
 * ==============================================================================
 * NEONVH MAIN HANDLER - SECURITY GATEWAY v3.0
 * ------------------------------------------------------------------------------
 * Chức năng: Routing, Authentication, Vault Management, Response Shielding.
 * ==============================================================================
 */

const shield = require('./core-shield');

/**
 * HÀM ĐÓNG GÓI PHẢN HỒI (Response Shielding)
 * Mọi dữ liệu trả về đều được mã hóa AES-256 trước khi ra khỏi Server.
 */
const secureSend = (res, data, status = 200) => {
    const stringifiedData = JSON.stringify(data);
    const encryptedPayload = shield.engine.encrypt(stringifiedData);
    
    // Tạo chữ ký xác thực gói tin (Anti-Tamper)
    const signature = shield.engine.hash(stringifiedData + process.env.SYSTEM_SECRET);

    return res.status(status).json({
        traceId: shield.engine.generateTraceId(),
        timestamp: Date.now(),
        payload: encryptedPayload,
        sig: signature
    });
};

/**
 * BỘ LỌC XÁC THỰC ADMIN (Boss Auth)
 */
const verifyBossAccess = (u, p) => {
    if (!u || !p) return false;
    // Băm thông tin đầu vào và so sánh với Master Hash trong .env
    const inputHash = shield.engine.hash(u + p);
    return inputHash === process.env.ADMIN_HASH;
};

/**
 * XỬ LÝ CHÍNH (Serverless Handler)
 */
export default async function handler(req, res) {
    const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    
    // 1. Áp dụng khiên Header ngay lập tức
    shield.firewall.setSecureHeaders(res);

    // 2. Kiểm tra Preflight (OPTIONS) cho CORS
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // 3. KIỂM TRA AN NINH HÀNH VI (Anti-Spam & Anti-Bot)
        if (shield.firewall.isSpamming(clientIP)) {
            console.error(`[SECURITY] IP Banned temporarily: ${clientIP}`);
            return res.status(429).json({ error: "Too many requests. Try again later." });
        }

        const identity = shield.firewall.validateIdentity(req.headers);
        if (!identity.ok) {
            return res.status(403).json({ error: `Access Denied: ${identity.msg}` });
        }

        // 4. LÀM SẠCH DỮ LIỆU ĐẦU VÀO (Deep Sanitization)
        const query = shield.sanitizer.cleanObject(req.query);
        const body = req.method === 'POST' ? shield.sanitizer.cleanObject(req.body) : {};

        const { type, action } = query;

        // 5. PHÂN LUỒNG LOGIC (Routing)
        switch (type) {
            
            // TRẠM 1: LẤY CẤU HÌNH FIREBASE (Vault)
            case 'get_gate':
                const configVault = {
                    apiKey: process.env.FB_API_KEY,
                    authDomain: process.env.FB_AUTH_DOMAIN,
                    projectId: process.env.FB_PROJECT_ID,
                    storageBucket: process.env.FB_STORAGE_BUCKET,
                    appId: process.env.FB_APP_ID
                };
                console.log(`[INFO] Gateway accessed by: ${clientIP}`);
                return secureSend(res, configVault);

            // TRẠM 2: XÁC THỰC QUYỀN BOSS (Admin Verify)
            case 'admin_verify':
                const { u, p } = query; // Hoặc lấy từ body nếu dùng POST
                if (verifyBossAccess(u, p)) {
                    console.log(`[SUCCESS] Boss logged in from IP: ${clientIP}`);
                    return secureSend(res, { 
                        role: "admin", 
                        status: "authenticated",
                        token: shield.engine.hash(Date.now().toString()) 
                    });
                } else {
                    console.warn(`[WARNING] Failed Admin login attempt from: ${clientIP}`);
                    return res.status(401).json({ error: "Unauthorized access." });
                }

            // TRẠM 3: KIỂM TRA TRẠNG THÁI (Heartbeat)
            case 'status':
                return secureSend(res, { system: "healthy", version: "3.0.4" });

            default:
                return res.status(404).json({ error: "API Endpoint not found." });
        }

    } catch (fatalError) {
        // Log lỗi ẩn danh (Không bao giờ hiện chi tiết lỗi server cho người dùng)
        console.error(`[CRITICAL_FAILURE] Trace: ${shield.engine.generateTraceId()} | Error:`, fatalError.message);
        return res.status(500).json({ error: "Internal Gateway Error. Please contact admin." });
    }
}
