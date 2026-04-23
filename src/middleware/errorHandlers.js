// Centralised error handlers
const notFoundHandler = (req, res, next) => {
  res.status(404);
  return res.render('errors/404', { title: 'Page Not Found' });
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  // Don't leak stack trace in production
  const message = process.env.NODE_ENV === 'production' ? 'An error occurred' : err.message;
  res.status(status);
  res.render('errors/500', { title: 'Error', message, error: process.env.NODE_ENV === 'production' ? {} : err });
};

module.exports = { notFoundHandler, errorHandler };