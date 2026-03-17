const CryptoJS = require("crypto-js");

module.exports = function(req, res) {
  // Mở cửa hoàn toàn để test xem có bị chặn không
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const firebaseConfig = {
    apiKey: process.env.FB_API_KEY,
    authDomain: process.env.FB_AUTH_DOMAIN,
    projectId: process.env.FB_PROJECT_ID,
    storageBucket: process.env.FB_STORAGE_BUCKET,
    messagingSenderId: process.env.FB_SENDER_ID,
    appId: process.env.FB_APP_ID
  };

  const SECRET_PASS = "NeonVH_TuyetMat_2026"; 
  const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(firebaseConfig), SECRET_PASS).toString();

  res.status(200).json({ secureData: encryptedData });
};
