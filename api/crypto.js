/**
 * CRYPTOGRAPHY ENGINE - NEONVH
 * Thuật toán: AES-256-CBC + SHA-512
 */

const CryptoJS = require('crypto-js');

// Lấy chìa khóa từ file .env (File 10)
const MASTER_KEY = process.env.CRYPTO_KEY; // Chuỗi 64 ký tự
const SYSTEM_SALT = process.env.SYSTEM_SALT; // Muối để băm mật khẩu

/**
 * Mã hóa dữ liệu kèm IV (Mỗi lần mã hóa sẽ ra kết quả khác nhau dù cùng nội dung)
 */
function encrypt(plainText) {
    try {
        const iv = CryptoJS.lib.WordArray.random(16); // Tạo IV ngẫu nhiên 128-bit
        const encrypted = CryptoJS.AES.encrypt(plainText, CryptoJS.enc.Utf8.parse(MASTER_KEY), {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });

        // Trả về: IV + Dữ liệu đã mã hóa (Dạng Base64)
        return iv.toString() + ":" + encrypted.toString();
    } catch (e) {
        console.error("Encryption Failed:", e);
        return null;
    }
}

/**
 * Giải mã dữ liệu (Dành cho nội bộ hoặc API nội bộ)
 */
function decrypt(cipherText) {
    try {
        const parts = cipherText.split(':');
        const iv = CryptoJS.enc.Hex.parse(parts[0]);
        const encryptedData = parts[1];

        const decrypted = CryptoJS.AES.decrypt(encryptedData, CryptoJS.enc.Utf8.parse(MASTER_KEY), {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });

        return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (e) {
        return null;
    }
}

/**
 * Băm mật khẩu siêu nặng (SHA-512 + Salt)
 */
function hash(text) {
    return CryptoJS.SHA512(text + SYSTEM_SALT).toString();
}

/**
 * Tạo ID ngắn ngẫu nhiên cho TraceID
 */
function generateShortId() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

module.exports = { encrypt, decrypt, hash, generateShortId };
