const CryptoJS = require("crypto-js");

module.exports = function(req, res) {
  // Mở cửa tường lửa (CORS)
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Trình duyệt check an ninh
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Nếu gọi đúng ám hiệu get_gate
  if (req.query.type === 'get_gate') {
    const firebaseConfig = {
      apiKey: process.env.FB_API_KEY,
      authDomain: process.env.FB_AUTH_DOMAIN,
      projectId: process.env.FB_PROJECT_ID,
      storageBucket: process.env.FB_STORAGE_BUCKET,
      messagingSenderId: process.env.FB_SENDER_ID,
      appId: process.env.FB_APP_ID
    };

    // Đóng gói két sắt
    const SECRET_PASS = "NeonVH_TuyetMat_2026"; 
    const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(firebaseConfig), SECRET_PASS).toString();

    return res.status(200).json({ secureData: encryptedData });
  }

  // Trả về cho chức năng Login Admin (để không bị lỗi)
  if (req.query.type === 'admin_verify') {
      const u = req.query.u;
      const p = req.query.p;
      // Chỗ này đại ca có thể hardcode pass Admin trên Vercel sau, giờ cứ return tạm để bypass
      if(u === 'Admin' && p === 'Admin123') {
          return res.status(200).json({ role: "admin" });
      }
      return res.status(200).json({ role: "user" });
  }

  return res.status(400).json({ error: "Lệnh không hợp lệ" });
};
