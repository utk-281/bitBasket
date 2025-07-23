const { Router } = require("express");
const { getAllProducts, getProduct } = require("../../controllers/shop/product.controller");
const router = Router();

router.get("/all", getAllProducts);
router.get("/:id", getProduct);

module.exports = router;
