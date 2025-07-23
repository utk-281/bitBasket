const expressAsyncHandler = require("express-async-handler");
const productCollection = require("../../models/product.models");
const ApiResponse = require("../../utils/ApiResponse.utils");

//& ─── get filtered products based on price, brand, category ────────────────────────────────────────────────────────────────
const getAllProducts = expressAsyncHandler(async (req, res, next) => {
  let { category = [], brand = [], sortBy = "price-lowToHigh" } = req.query;
  let filters = {};
  if (category.length > 0) filters.category = { $in: category.split(",") };
  if (brand.length > 0) filters.brand = { $in: brand.split(",") };

  let sort = {};
  if (sortBy === "price-lowToHigh") sort.price = 1;
  if (sortBy === "price-highToLow") sort.price = -1;
  if (sortBy === "title-aToZ") sort.title = 1;
  if (sortBy === "title-zToA") sort.title = -1;
  //   if(sortBy==="oldToNew") sort.createdAt = _1

  let products = await productCollection.find(filters).sort(sort);
  new ApiResponse(200, true, "Products fetched successfully", products).send(res);
});

const getProduct = expressAsyncHandler(async (req, res, next) => {});

module.exports = {
  getAllProducts,
  getProduct,
};
