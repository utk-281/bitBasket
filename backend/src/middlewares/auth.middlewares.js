const jwt = require("jsonwebtoken");
const userCollection = require("../models/user.models");
const expressAsyncHandler = require("express-async-handler");
const ErrorHandler = require("../utils/ErrorHandler.utils");

const authenticate = expressAsyncHandler(async (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization.split(" ")[1];
  if (!token) return next(new ErrorHandler("You are not logged in", 401));

  const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
  const user = await userCollection.findById(decodedToken.id);
  if (!user) return next(new ErrorHandler("Invalid token, please login again", 401));

  req.user = user;
  next();
});

module.exports = { authenticate };
