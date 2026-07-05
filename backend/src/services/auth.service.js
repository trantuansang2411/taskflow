const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/user.repository');
const refreshTokenRepository = require('../repositories/refreshToken.repository');
const AppError = require('../utils/AppError');

const generateAccessToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const generateRefreshToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
  });

const getRefreshTokenExpiry = () => {
  const days = parseInt(process.env.JWT_REFRESH_EXPIRES_IN, 10) || 7;
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

const authService = {
  async register({ username, email, password }) {
    const existingEmail = await userRepository.findByEmail(email);
    if (existingEmail) throw new AppError('Email already in use', 409);

    const existingUsername = await userRepository.findByUsername(username);
    if (existingUsername) throw new AppError('Username already taken', 409);

    const rounds = parseInt(process.env.BCRYPT_ROUNDS, 10) || 10;
    const hashed = await bcrypt.hash(password, rounds);

    const user = await userRepository.create({ username, email, password: hashed, role: 'employee' });
    return user;
  },

  async login({ email, password }) {
    const user = await userRepository.findByEmail(email);
    if (!user) throw new AppError('Invalid credentials', 401);

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new AppError('Invalid credentials', 401);

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    await refreshTokenRepository.create({
      userId: user.id,
      token: refreshToken,
      expiresAt: getRefreshTokenExpiry(),
    });

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, username: user.username, email: user.email, role: user.role },
    };
  },

  async refreshToken(token) {
    if (!token) throw new AppError('Refresh token required', 400);

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    const stored = await refreshTokenRepository.findByToken(token);
    if (!stored) throw new AppError('Refresh token not found', 401);

    if (new Date(stored.expires_at) < new Date()) {
      await refreshTokenRepository.deleteByToken(token);
      throw new AppError('Refresh token expired', 401);
    }

    const accessToken = generateAccessToken(payload.userId);
    return { accessToken };
  },

  async logout(token) {
    if (token) await refreshTokenRepository.deleteByToken(token);
  },
};

module.exports = authService;
