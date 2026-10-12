const crypto = require('node:crypto');

// There is no login system, so each browser gets a random anonymous id stored in a cookie.
// Favorites and reviews are filed under that id, which keeps every browser's records separate.
const COOKIE_NAME = 'dishcovery_uid';
const TWO_YEARS_MS = 2 * 365 * 24 * 60 * 60 * 1000;
const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function readCookie(header, name) {
  if (!header) return null;
  for (const part of header.split(';')) {
    const i = part.indexOf('=');
    if (i < 0 || part.slice(0, i).trim() !== name) continue;
    try {
      return decodeURIComponent(part.slice(i + 1).trim());
    } catch {
      return null;
    }
  }
  return null;
}

function cookieOptions() {
  const sameSite = (process.env.COOKIE_SAMESITE || 'lax').toLowerCase();
  const secure = sameSite === 'none' ? true : process.env.COOKIE_SECURE === 'true';
  return { httpOnly: true, sameSite, secure, maxAge: TWO_YEARS_MS, path: '/' };
}

function anonymousUser(req, res, next) {
  let id = readCookie(req.headers.cookie, COOKIE_NAME);
  if (!id || !UUID_V4.test(id)) {
    id = crypto.randomUUID();
    res.cookie(COOKIE_NAME, id, cookieOptions());
  }
  req.ownerId = id.toLowerCase();
  next();
}

module.exports = anonymousUser;
