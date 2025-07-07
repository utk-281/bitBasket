require("dotenv").config();
const express = require("express");
const error = require("./src/middlewares/error.middlewares");
const cookieParser = require("cookie-parser");

//& ─── routes file import ────────────────────────────────────────────────────────────────
const userRoutes = require("./src/routes/user/user.routes");

const app = express();

//& ─── middleware ────────────────────────────────────────────────────────────────────────
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(cookieParser());

//& ─── routes ─────────────────────────────────────────────────────────────────────────────
app.use("/api/users", userRoutes); // User routes

//& ─── error middleware ────────────────────────────────────────────────────────────────────
app.use(error);

module.exports = app;

// https://github.com/Sarvesh-1999/qshop/tree/backend
