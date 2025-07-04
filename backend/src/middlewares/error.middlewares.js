const error = (err, req, res, next) => {
  console.log("error middleware called", err);
  // ─── ValidationError ────────────────────────────────────────────────────────────────
  if (err.name === "ValidationError") {
    err.message = "something is missing";
    err.statusCode = 400;
  }

  err.message = err.message || "Internal Server Error";
  err.statusCode = err.statusCode || 500;

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    errObject: err,
  });
};

module.exports = error;
