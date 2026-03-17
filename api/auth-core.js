const crypto = require('./crypto');
const security = require('./security');

async function verifyBoss(u, p) {
    // Tạo độ trễ ngẫu nhiên để đánh lừa công cụ đo thời gian của hacker
    await security.sleep(Math.random() * 500 + 200);

    const adminHash = process.env.ADMIN_HASH;
    const inputHash = crypto.hash(u + p);

    return inputHash === adminHash;
}

module.exports = { verifyBoss };
