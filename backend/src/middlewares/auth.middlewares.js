const jwt = require("jsonwebtoken");
const userCollection = require("../models/user.models");
const expressAsyncHandler = require("express-async-handler");
const ErrorHandler = require("../utils/ErrorHandler.utils");

//& ─── authentication middleware ────────────────────────────────────────────────────────────────
const authenticate = expressAsyncHandler(async (req, res, next) => {
  const token = req?.cookies?.token || req?.headers?.authorization?.split(" ")[1];
  if (!token) return next(new ErrorHandler("You are not logged in", 401));

  const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
  // console.log(decodedToken);
  const user = await userCollection.findById(decodedToken.payload);
  if (!user) return next(new ErrorHandler("Invalid token, please login again", 401));

  req.user = user;
  next();
});

//& ─── authorization middleware ────────────────────────────────────────────────────────────────
const authorization = expressAsyncHandler(async (req, res, next) => {
  if (req.user.role !== "admin") {
    return next(new ErrorHandler("You are not authorized to perform this action", 403));
  }
  next();
});

//& ─── export middlewares ──────────────────────────────────────────────────────────────────────
module.exports = { authenticate, authorization };
