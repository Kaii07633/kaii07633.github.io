const CryptoJS = require("crypto-js");

module.exports = function(req, res) {
  // 1. Mở cửa cho phép web của đại ca gọi vào (CORS)
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  // 2. Bốc chìa khóa Firebase từ Vercel
  const firebaseConfig = {
    apiKey: process.env.FB_API_KEY,
    authDomain: process.env.FB_AUTH_DOMAIN,
    projectId: process.env.FB_PROJECT_ID,
    storageBucket: process.env.FB_STORAGE_BUCKET,
    messagingSenderId: process.env.FB_SENDER_ID,
    appId: process.env.FB_APP_ID
  };

  // 3. Mã hóa toàn bộ cấu hình
  const SECRET_PASS = "NeonVH_TuyetMat_2026"; 
  const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(firebaseConfig), SECRET_PASS).toString();

  // 4. Quăng cục dữ liệu đã mã hóa về
  res.status(200).json({ secureData: encryptedData });
};
