const logger = require('../utils/logger');
const AppError = require('../utils/AppError');

const errorHandler = (err, req, res, next) => {
  logger.error(`${err.message}${err.stack ? '\n' + err.stack : ''}`);

  if (err instanceof AppError && err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  // Unexpected / programmer errors — don't leak details
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong',
  });
};

module.exports = { errorHandler };
