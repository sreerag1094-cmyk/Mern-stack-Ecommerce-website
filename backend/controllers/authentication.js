const jwt = require('jsonwebtoken');
const User = require('../models/user');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const userPayload = (user, token) => ({
  success: true,
  token,
  user: { _id: user._id, name: user.name, email: user.email, role: user.role },
});

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      res.status(400);
      throw new Error('Name, email and password are required');
    }
    if (await User.findOne({ email: email.toLowerCase() })) {
      res.status(409);
      throw new Error('Email already registered');
    }
    // role is never taken from the request: public sign-ups are always "user"
    const user = await User.create({ name, email, password, role: 'user' });
    res.status(201).json(userPayload(user, signToken(user._id)));
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400);
      throw new Error('Email and password are required');
    }
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      res.status(401);
      throw new Error('Invalid email or password');
    }
    res.json(userPayload(user, signToken(user._id)));
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me  (token validation used by the frontend on app load)
exports.getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};
