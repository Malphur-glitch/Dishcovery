// Throw this anywhere in a route; the error handler turns it into { error: { message } }.
class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

module.exports = HttpError;
