const userCollection = require("../../models/user.models");
const expressAsyncHandler = require("express-async-handler");
const ApiResponse = require("../../utils/ApiResponse.utils");

//& ─── register user ────────────────────────────────────────────────────────────────
const registerUser = expressAsyncHandler(async (req, res, next) => {
  let { userName, email, password } = req.body;

  let newUser = 
  await userCollection.create({
    userName,
    email,
    password,
  });

  new ApiResponse(201, true, "user registered successfully", newUser).send(res);
});

//& ─── export ────────────────────────────────────────────────────────────────

module.exports = {
  registerUser,
};

//TODO: error middleware --> validatoor
