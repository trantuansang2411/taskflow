const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const userRepository = require('../repositories/user.repository');

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Access token required', 401));
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userRepository.findById(payload.userId);
    if (!user) return next(new AppError('User no longer exists', 401));

    req.userId = user.id;
    req.userRole = user.role;
    next();
  } catch {
    next(new AppError('Invalid or expired access token', 401));
  }
};

module.exports = { authenticate };
