const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Verifies the Bearer token and attaches the user to req.user
const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    if (!header.startsWith('Bearer ')) {
      res.status(401);
      throw new Error('Not authorized, no token');
    }
    const token = header.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      res.status(401);
      throw new Error(e.name === 'TokenExpiredError' ? 'Token expired' : 'Token invalid');
    }
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      res.status(401);
      throw new Error('User no longer exists');
    }
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

// Like protect but never fails; used for optionally personalised endpoints
const optionalAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    if (header.startsWith('Bearer ')) {
      const decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    }
  } catch (e) {
    /* ignore invalid token */
  }
  next();
};

// Role-based access control
const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    res.status(403);
    return next(new Error('Forbidden: insufficient permissions'));
  }
  next();
};

const admin = authorize('admin');

module.exports = { protect, optionalAuth, authorize, admin };
