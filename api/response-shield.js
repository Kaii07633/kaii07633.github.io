const crypto = require('./crypto');

function send(res, data, status = 200) {
    const body = {
        ts: Date.now(),
        data: crypto.encrypt(JSON.stringify(data)),
        signature: crypto.hash(JSON.stringify(data) + process.env.SYSTEM_SECRET)
    };
    return res.status(status).json(body);
}

module.exports = { send };
