/**
 * ADVANCED SECURITY MODULE - NEONVH
 * Chuyên trách: Chặn Bot, Chống DDoS, Xác thực Origin
 */

const crypto = require('./crypto');

// Danh sách đen IP (Có thể kết nối Database để lấy danh sách động)
const BLACKLISTED_IPS = ['1.2.3.4', '5.6.7.8']; 
const requestLog = new Map(); // Lưu tạm để đếm Rate Limit

/**
 * Kiểm tra xem IP có đang spam không
 */
async function isRateLimited(ip) {
    const now = Date.now();
    const timeframe = 60000; // 1 phút
    const maxRequests = 30; // 30 yêu cầu/phút

    if (BLACKLISTED_IPS.includes(ip)) return true;

    if (!requestLog.has(ip)) {
        requestLog.set(ip, []);
    }

    const timestamps = requestLog.get(ip);
    const recentRequests = timestamps.filter(t => now - t < timeframe);
    recentRequests.push(now);
    requestLog.set(ip, recentRequests);

    return recentRequests.length > maxRequests;
}

/**
 * Kiểm tra tính toàn vẹn của Header (Honeypot & Bot Detection)
 */
function verifyHeaders(headers) {
    const userAgent = headers['user-agent'] || '';
    const origin = headers['origin'] || '';
    const referer = headers['referer'] || '';

    // 1. Chặn các thư viện crawler phổ biến
    const botPatterns = [/python/i, /curl/i, /postman/i, /insomnia/i, /axios/i, /go-http/i];
    if (botPatterns.some(pattern => pattern.test(userAgent))) {
        return { valid: false, reason: "Bot detected via User-Agent" };
    }

    // 2. Chặn yêu cầu không có Origin (trừ khi là trình duyệt cũ, nhưng ta ưu tiên bảo mật)
    if (!origin || !origin.includes('neonvh.github.io')) {
        return { valid: false, reason: "CORS Violation: Unauthorized Origin" };
    }

    // 3. Chặn các yêu cầu giả mạo AJAX
    if (headers['x-requested-with'] !== 'XMLHttpRequest') {
        // Lưu ý: Nếu web chính không dùng XMLHttpRequest thì có thể bỏ qua dòng này
    }

    return { valid: true };
}

/**
 * Chống Timing Attack (Làm giả độ trễ xử lý)
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = { isRateLimited, verifyHeaders, sleep };
