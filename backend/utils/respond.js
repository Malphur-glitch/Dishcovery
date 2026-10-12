// Every successful response uses the envelope { data: ... }.
const ok = (res, data, status = 200) => res.status(status).json({ data });

module.exports = { ok };
