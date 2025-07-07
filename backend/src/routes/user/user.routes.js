const { Router } = require("express");
const { registerUser, loginUser, logoutUser } = require("../../controllers/user/user.controllers");

const router = Router();

//& ─── register user ────────────────────────────────────────────────────────────────
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);

// get-me

module.exports = router;
