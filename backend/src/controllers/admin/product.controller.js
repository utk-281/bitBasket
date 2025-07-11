const productCollection = require("../../models/product.models");
const expressAsyncHandler = require("express-async-handler");
const ApiResponse = require("../../utils/ApiResponse.utils");
const ErrorHandler = require("../../utils/ErrorHandler.utils");
const {
  uploadImageOnCloudinary,
  getPublicId,
  deleteImageFromCloudinary,
} = require("../../utils/cloudinary.utils");

//& ─── upload image ────────────────────────────────────────────────────────────────
const uploadImage = expressAsyncHandler(async (req, res, next) => {
  console.log(req.file); // for uploading single image
  // console.log(req.files); // for uploading multiple images

  let b64 = Buffer.from(req.file.buffer).toString("base64");
  let url = "data:" + req.file.mimetype + ";base64," + b64;
  // console.log(url);
  let uploaded = await uploadImageOnCloudinary(url);
  // console.log(uploaded);
  new ApiResponse(
    200,
    true,
    "Image uploaded successfully",
    uploaded.secure_url,
    uploaded.asset_id
  ).send(res);
});

//& ─── Delete image ────────────────────────────────────────────────────────────────
const deleteImage = expressAsyncHandler(async (req, res, next) => {
  let url = req.body.url;
  let public_id = getPublicId(url);
  let deletedImage = await deleteImageFromCloudinary(public_id);
  if (!deletedImage) return next(new ErrorHandler("Image not found", 404));
  new ApiResponse(200, true, "Image deleted successfully").send(res);
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
  deleteImage,
};

/*
 req.file = {
  fieldname: 'image',
  originalname: 'Screenshot (20).png',
  encoding: '7bit',
  mimetype: 'image/png',
  buffer: <Buffer 89 50 4e 47 0d 0a 1a 0a 00 00 00 0d 49 48 44 52 00 00 0a 00 00 00 05 a0 08 06 00 00 00 92 00 1a df 00 00 00 01 73 52 47 42 00 ae ce 1c e9 00 00 00 04 ... 7228052 more bytes>,
  size: 7228102
}

let uploaded = {
  asset_id: 'ee3812ff49423cb71caeabdccd293957',
  public_id: 'eKart/q1yafvbq3d5xx7jduero',
  version: 1752128313,
  version_id: '12bc2e47715af178078cbc978b0907eb',
  signature: 'd5d9f7ca75dc5dc171bc3589c39713149ea5a2e6',
  width: 2560,
  height: 1440,
  format: 'png',
  resource_type: 'image',
  created_at: '2025-07-10T06:18:33Z',
  tags: [],
  bytes: 7228102,
  type: 'upload',
  etag: '9bec15763c07a75c3c42db725f390213',
  placeholder: false,
  url: 'http://res.cloudinary.com/dynuatcqe/image/upload/v1752128313/eKart/q1yafvbq3d5xx7jduero.png',
  secure_url: 'https://res.cloudinary.com/dynuatcqe/image/upload/v1752128313/eKart/q1yafvbq3d5xx7jduero.png',
  asset_folder: 'eKart',
  display_name: 'q1yafvbq3d5xx7jduero',
  api_key: '616978421991279'
}

 */

// https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.pexels.com%2Fsearch%2Fbeautiful%2F&psig=AOvVaw2uzv905wKGZA2BX-_X0Vbd&ust=1752297822185000&source=images&cd=vfe&opi=89978449&ved=0CBEQjRxqFwoTCLjb45uItI4DFQAAAAAdAAAAABAE
