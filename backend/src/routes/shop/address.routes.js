const { Router } = require("express");
const {
  addAddress,
  getAddresses,
  getAddress,
  editAddress,
  deleteAddress,
} = require("../../controllers/shop/address.controller");
const router = Router();

router.post("/add", addAddress);
router.get("/all", getAddresses);
router.get("/:id", getAddress);
router.patch("/:id", editAddress);
router.delete("/:id", deleteAddress);

module.exports = router;
