const { Router } = require("express");
const { createOrder } = require("../../controllers/shop/order.controller");
const router = Router();

router.post("/create", createOrder);

module.exports = router;
