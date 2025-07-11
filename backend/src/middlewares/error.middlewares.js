const error = (err, req, res, next) => {
  // let duplicateObj = { ...err };
  console.log("error middleware called", err);

  //& ─── ValidationError ────────────────────────────────────────────────────────────────
  if (err.name === "ValidationError") {
    err.message = Object.values(err.errors)
      .map((err) => err.message)
      .join(", ");
    err.statusCode = 400;
  }

  //& ─── Duplicate key error ────────────────────────────────────────────────────────────────
  if (err.code === 11000) {
    let field = Object.keys(err.keyValue)[0];
    err.message = `Provided ${field} is already in use`;
    err.statusCode = 409; // conflict
  }

  //& ─── CastError ────────────────────────────────────────────────────────────────
  if (err.name === "CastError") {
    err.message = "Invalid ID format, please check the ID you provided";
    err.statusCode = 400;
  }

  //& ─── JsonWebTokenError ────────────────────────────────────────────────────────────────
  if (err.name === "JsonWebTokenError") {
    err.message = "Invalid token, please login again";
    err.statusCode = 401;
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
