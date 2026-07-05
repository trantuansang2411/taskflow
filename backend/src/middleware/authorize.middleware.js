const AppError = require('../utils/AppError');

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.userRole)) {
    return next(new AppError('You do not have permission to perform this action', 403));
  }
  next();
};

module.exports = { authorize };
