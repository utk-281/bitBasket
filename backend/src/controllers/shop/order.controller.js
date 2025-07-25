const orderCollection = require("../../models/order.models");
const userCollection = require("../../models/user.models");
const productCollection = require("../../models/product.models");
const addressCollection = require("../../models/address.models");
const cartCollection = require("../../models/cart.models");
const paypal = require("../../config/paypal.config");
const asyncHandler = require("express-async-handler");

const createOrder = asyncHandler(async (req, res, next) => {
  console.log(req.body);
  let userId = req.user._id;
  let { cartId, addressId, paymentMode } = req.body;
  //? thorough cartId we will fetch cart details and through addressId we will fetch address details

  let cart = await cartCollection.findOne({ _id: cartId });
  let address = await addressCollection.findOne({ _id: addressId });
  console.log(cart);
  console.log(address);
});

module.exports = {
  createOrder,
};
