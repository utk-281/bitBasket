class ErrorHandler extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor); // Capture the stack trace for better debugging
  }
}

module.exports = ErrorHandler;
