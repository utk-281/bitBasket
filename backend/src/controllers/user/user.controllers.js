const userCollection = require("../../models/user.models");
const expressAsyncHandler = require("express-async-handler");
const ApiResponse = require("../../utils/ApiResponse.utils");
const ErrorHandler = require("../../utils/ErrorHandler.utils");
const { generateJwtToken } = require("../../utils/jwt.utils");

//& ─── register user ────────────────────────────────────────────────────────────────
const registerUser = expressAsyncHandler(async (req, res, next) => {
  let { userName, email, password } = req.body;

  let newUser = await userCollection.create({
    userName,
    email,
    password,
  });

  new ApiResponse(201, true, "user registered successfully", newUser).send(res);
});

//& ─── login user ────────────────────────────────────────────────────────────────
const loginUser = expressAsyncHandler(async (req, res, next) => {
  let { email, password } = req.body;
  let existingUser = await userCollection.findOne({ email }).select("+password");
  console.log(existingUser);
  if (!existingUser) return next(new ErrorHandler("No account found with this email", 404));

  let isMatch = await existingUser.comparePassword(password);
  console.log(isMatch);
  if (!isMatch) return next(new ErrorHandler("Invalid credentials", 404));

  let token = await generateJwtToken(existingUser._id);
  console.log(token);

  console.log(process.env.JWT_COOKIE_EXPIRY);

  res.cookie("token", token, {
    maxAge: process.env.JWT_COOKIE_EXPIRY * 60 * 60 * 1000,
  });

  new ApiResponse(200, true, "Logged in successfully", existingUser, token).send(res);
});

//& ─── logout user ────────────────────────────────────────────────────────────────
const logoutUser = expressAsyncHandler(async (req, res, next) => {
  res.clearCookie("token");
  new ApiResponse(200, true, "Logged out successfully").send(res);
});

//& ─── export ────────────────────────────────────────────────────────────────

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
};
