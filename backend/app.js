require("dotenv").config();
const express = require("express");
const error = require("./src/middlewares/error.middlewares");
const cookieParser = require("cookie-parser");
const path = require("path");
const { seedAdmin } = require("./seedData/adminSeed");

// console.log(process.argv);

//& ─── admin seed ────────────────────────────────────────────────────────────────
// nodemon server seed
if (process.argv[2] === "seed") {
  seedAdmin();
}

//& ─── routes file import ────────────────────────────────────────────────────────────────
const userRoutes = require("./src/routes/user/user.routes");
const productRoutes = require("./src/routes/admin/product.routes");
const shopCartRoutes = require("./src/routes/shop/cart.routes");
const shopProductRoutes = require("./src/routes/shop/product.routes");
const shopAddressRoutes = require("./src/routes/shop/address.routes");
const shopOrderRoutes = require("./src/routes/shop/order.routes");

//& ─── middlewares import ────────────────────────────────────────────────────────────────
const { authenticate, authorization } = require("./src/middlewares/auth.middlewares");

//& ─── express app initialization ─────────────────────────────────────────────────────────
const app = express();

//& ─── middleware ────────────────────────────────────────────────────────────────────────
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(cookieParser());

//& ─── api routes ─────────────────────────────────────────────────────────────────────────────
app.use("/api/v1/users", userRoutes); // User routes`
app.use("/api/v1/admin/products", authenticate, authorization, productRoutes); // Product routes
app.use("/api/v1/shop/cart", authenticate, shopCartRoutes); // Shop cart routes
app.use("/api/v1/shop/products", shopProductRoutes); // Shop product routes
app.use("/api/v1/shop/address", authenticate, shopAddressRoutes); // Shop address routes
app.use("/api/v1/shop/orders", authenticate, shopOrderRoutes); // Shop address routes

//& ─── error middleware ────────────────────────────────────────────────────────────────────
app.use(error);

module.exports = app;

// https://github.com/Sarvesh-1999/qshop/tree/backend
