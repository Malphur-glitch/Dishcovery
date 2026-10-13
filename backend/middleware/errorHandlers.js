const notFound = (req, res) => {
  res.status(404).json({ error: { message: `Route not found: ${req.method} ${req.originalUrl}` } });
};

const errorHandler = (err, req, res, next) => {
  let status = err.status || err.statusCode || 500;
  let message = err.message;

  if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'The request body is not valid JSON.';
  } else if (err.type === 'entity.too.large') {
    status = 413;
    message = 'The request body is too large.';
  } else if (err.name === 'ValidationError' && err.errors) {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(' ');
  } else if (err.name === 'CastError') {
    status = 400;
    message = `Invalid value for "${err.path}".`;
  } else if (err.code === 11000) {
    status = 409;
    message = 'That record already exists.';
  } else if (status >= 500) {
    console.error('Unhandled error:', err);
    message = 'Something went wrong on the server.';
  }

  res.status(status).json({ error: { message } });
};

module.exports = { notFound, errorHandler };
