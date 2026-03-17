/**
 * IP INTELLIGENCE - CHẶN VPN & PROXY
 */
async function isSuspicious(ip) {
    // Nếu ip là localhost, bỏ qua
    if (ip === '::1' || ip === '127.0.0.1') return false;

    // Đại ca có thể dùng API của ip-api.com để check Proxy/VPN ở đây
    try {
        const response = await fetch(`http://ip-api.com/json/${ip}?fields=proxy,hosting`);
        const data = await response.json();
        return data.proxy || data.hosting; // Nếu là Proxy hoặc server ảo (Hosting) thì chặn
    } catch(e) {
        return false; // Nếu lỗi API thì tạm cho qua để tránh sập web
    }
}

module.exports = { isSuspicious };
