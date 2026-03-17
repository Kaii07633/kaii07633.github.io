/**
 * DEEP SANITIZER ENGINE - ANTI-HACK
 * Chức năng: Quét và loại bỏ mã độc từ mọi Request
 */
const patterns = [
    /<script\b[^>]*>([\s\S]*?)<\/script>/gim, // Chống XSS
    /(\%27)|(\')|(\-\-)|(\%23)|(#)/ix,         // Chống SQL Injection
    /(<|%3C).*script.*(>|%3E)/i,
    /eval\(.*\)/gi,                            // Chống thực thi mã từ xa
    /union.*select/i,
    /javascript:/gi
];

function sanitize(input) {
    if (typeof input !== 'string') return input;
    let clean = input;
    patterns.forEach(p => {
        clean = clean.replace(p, '[BLOCK_DATA]');
    });
    // Loại bỏ các ký tự điều khiển nguy hiểm
    return clean.trim().replace(/[^\x20-\x7E]/g, '');
}

function deepClean(obj) {
    if (Array.isArray(obj)) {
        return obj.map(v => deepClean(v));
    } else if (obj !== null && typeof obj === 'object') {
        const newObj = {};
        for (const key in obj) {
            newObj[sanitize(key)] = deepClean(obj[key]);
        }
        return newObj;
    }
    return sanitize(obj);
}

module.exports = { deepClean };
