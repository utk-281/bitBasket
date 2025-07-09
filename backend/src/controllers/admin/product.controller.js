const productCollection = require("../../models/product.models");
const expressAsyncHandler = require("express-async-handler");
const ApiResponse = require("../../utils/ApiResponse.utils");
const ErrorHandler = require("../../utils/ErrorHandler.utils");

const uploadImage = expressAsyncHandler(async (req, res, next) => {
  console.log(req.file);
});

//& ─── add product ────────────────────────────────────────────────────────────────
const addProduct = expressAsyncHandler(async (req, res, next) => {
  let { image, title, description, category, brand, price, salePrice, totalStock } = req.body;

  let product = await productCollection.create({
    image,
    title,
    description,
    category,
    brand,
    price,
    salePrice,
    totalStock,
  });

  new ApiResponse(201, true, "product added", product).send(res);
});

//& ─── get all products ────────────────────────────────────────────────────────────────
const getAllProducts = expressAsyncHandler(async (req, res, next) => {
  const products = await productCollection.find();
  if (products.length === 0) return next(new ErrorHandler("No products found", 404));

  new ApiResponse(200, true, "All products fetched successfully", products).send(res);
});

//& ─── get product by id ────────────────────────────────────────────────────────────────
const getProduct = expressAsyncHandler(async (req, res, next) => {
  let product = await productCollection.findById(req.params.id);
  if (!product) return next(new ErrorHandler("Product not found", 404));

  new ApiResponse(200, true, "Product fetched successfully", product).send(res);
});

//& ─── update product ────────────────────────────────────────────────────────────────
const updateProduct = expressAsyncHandler(async (req, res, next) => {
  let product = await productCollection.findByIdAndUpdate(
    req.params.id, // filter part
    req.body, // update part
    {
      // options
      new: true, // return the updated document
      runValidators: true, // validate the update against the schema
    }
  );

  if (!product) return next(new ErrorHandler("Product not found", 404));

  new ApiResponse(200, true, "Product updated successfully", product).send(res);
});

//& ─── delete product ────────────────────────────────────────────────────────────────
const deleteProduct = expressAsyncHandler(async (req, res, next) => {
  let product = await productCollection.findByIdAndDelete(req.params.id);
  if (!product) return next(new ErrorHandler("Product not found", 404));

  new ApiResponse(200, true, "Product deleted successfully", product).send(res);
});

module.exports = {
  uploadImage,
  addProduct,
  getAllProducts,
  getProduct,
  updateProduct,
  deleteProduct,
};
