require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const csrf = require('csurf');

const authRoutes = require('./routes/auth');
const devproofRoutes = require('./routes/devproof');
const quickhireRoutes = require('./routes/quickhire');
const scrimlinkRoutes = require('./routes/scrimlink');
const profileRoutes = require('./routes/profiles');
const projectRoutes = require('./routes/projects');
const hireRoutes = require('./routes/hire');
const teamRoutes = require('./routes/teams');
const scrimRoutes = require('./routes/scrims');
const messageRoutes = require('./routes/messages');
const adminRoutes = require('./routes/admin');
const profileDashRoutes = require('./routes/profile');

const { notFoundHandler, errorHandler } = require('./middleware/errorHandlers');

const app = express();

app.set('trust proxy', 1);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('[DB] MongoDB connected'))
  .catch((err) => console.error('[DB] MongoDB connection error:', err.message));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

app.disable('x-powered-by');

app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(express.static(path.join(__dirname, '../public')));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'change-this-secret',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      collectionName: 'sessions',
    }),
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

app.use((req, res, next) => {
  res.locals.currentUser = req.session?.userId || null;
  res.locals.session = req.session || {};
  res.locals.csrfToken = '';
  next();
});

const csrfProtection = csrf();

app.use((req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    csrfProtection(req, res, (err) => {
      if (!err) {
        res.locals.csrfToken = req.csrfToken();
      }
      return next();
    });
  } else {
    csrfProtection(req, res, (err) => {
      if (err) {
        return res.status(403).render('errors/403', {
          title: 'Forbidden',
        });
      }

      res.locals.csrfToken = req.csrfToken();
      return next();
    });
  }
});

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.use('/', authRoutes);
app.use('/dashboard/devproof', devproofRoutes);
app.use('/dashboard/quickhire', quickhireRoutes);
app.use('/dashboard/scrimlink', scrimlinkRoutes);
app.use('/dashboard/profile', profileDashRoutes);
app.use('/u', profileRoutes);
app.use('/projects', projectRoutes);
app.use('/hire', hireRoutes);
app.use('/teams', teamRoutes);
app.use('/scrims', scrimRoutes);
app.use('/messages', messageRoutes);
app.use('/admin', adminRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`[SERVER] DevArena running on port ${PORT}`);
});
