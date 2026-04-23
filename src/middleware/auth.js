// Authentication and authorisation middleware

// Require a user to be authenticated
function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.redirect('/login');
  }
  return next();
}

// Require a user to be an admin
function requireAdmin(req, res, next) {
  if (!req.session || !req.session.userId || req.session.role !== 'admin') {
    return res.status(403).render('errors/403', { title: 'Forbidden' });
  }
  return next();
}

module.exports = { requireAuth, requireAdmin };