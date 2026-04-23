require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const csrf = require('csurf');

// Import route modules
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

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB connected');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});

// Set up view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(helmet());
app.disable('x-powered-by');

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'changeme',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

// CSRF protection
app.use(csrf());

// Make csrfToken and currentUser available in views
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  res.locals.currentUser = req.session.userId;
  res.locals.session = req.session;
  next();
});

// Rate limiter (global)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/', authRoutes);
app.use('/dashboard/devproof', devproofRoutes);
app.use('/dashboard/quickhire', quickhireRoutes);
app.use('/dashboard/scrimlink', scrimlinkRoutes);
app.use('/u', profileRoutes);
app.use('/projects', projectRoutes);
app.use('/hire', hireRoutes);
app.use('/teams', teamRoutes);
app.use('/scrims', scrimRoutes);
app.use('/messages', messageRoutes);
app.use('/admin', adminRoutes);
app.use('/dashboard/profile', profileDashRoutes);

// 404 handler
app.use(notFoundHandler);
// Central error handler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});