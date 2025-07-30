const { Router } = require("express");
const { createOrder, capturePayment } = require("../../controllers/shop/order.controller");
const router = Router();

router.post("/create", createOrder);
router.patch("/capture-payment", capturePayment);

module.exports = router;
