const statusMap = new Map();

module.exports = {
    setStatus: (id, status) => statusMap.set(id, status),
    getStatus: (id) => statusMap.get(id) || "NOT_FOUND"
};
