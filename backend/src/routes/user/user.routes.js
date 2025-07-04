const { Router } = require("express");
const { registerUser } = require("../../controllers/user/user.controllers");
const router = Router();

//& ─── register user ────────────────────────────────────────────────────────────────
router.post("/register", registerUser);

module.exports = router;
