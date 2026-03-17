function validateGamePayload(data) {
    const allowed = ['title', 'author', 'version', 'genre', 'desc', 'cover', 'links', 'progress', 'is18'];
    const filtered = {};
    allowed.forEach(key => {
        if (data[key] !== undefined) filtered[key] = data[key];
    });
    return filtered;
}

module.exports = { validateGamePayload };
