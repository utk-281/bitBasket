const { Router } = require("express");
const {
  addProduct,
  getAllProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
  deleteImage,
} = require("../../controllers/admin/product.controller");
const upload = require("../../middlewares/multer.middleware");

const router = Router();

router.post("/add-image", upload.single("image"), uploadImage);
router.post("/add", addProduct);
router.get("/all", getAllProducts);
router.get("/:id", getProduct);
router.patch("/edit/:id", updateProduct);
router.delete("/delete/:id", deleteProduct);
router.patch("/delete-image", upload.none(), deleteImage);

module.exports = router;
