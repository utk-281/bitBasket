const orderCollection = require("../../models/order.models");
const userCollection = require("../../models/user.models");
const productCollection = require("../../models/product.models");
const addressCollection = require("../../models/address.models");
const cartCollection = require("../../models/cart.models");
const expressAsyncHandler = require("express-async-handler");
const ErrorHandler = require("../../utils/ErrorHandler.utils");
const paypal = require("../../config/paypal.config");
const ApiResponse = require("../../utils/ApiResponse.utils");

//! Create Order Controller - Handles both COD and PayPal online payment orders
const createOrder = expressAsyncHandler(async (req, res, next) => {
  // ✅ Step 1: Get the logged-in user's ID from the request (after auth middleware has added req.user)
  const userId = req.user._id;

  // ✅ Step 2: Get cartId, addressId, and paymentMethod from the request body (coming from frontend)
  const { cartId, addressId, paymentMethod } = req.body;

  // ✅ Step 3: Validate if all required inputs are present
  if (!cartId || !addressId) {
    return next(new ErrorHandler("Missing required fields", 400)); // Throw error if any field is missing
  }

  // ✅ Step 4: Fetch the cart details from the database using cartId
  const cart = await cartCollection.findById(cartId);

  // ✅ Step 5: Check if the cart exists and belongs to the logged-in user (userId)
  if (!cart || cart.userId.toString() !== userId.toString()) {
    return next(new ErrorHandler("Invalid or unauthorized cart", 404)); // Cart not found or unauthorized access
  }

  // ✅ Step 6: Fetch the delivery address details using addressId
  const address = await addressCollection.findById(addressId);

  // ✅ Step 7: Validate the address belongs to the logged-in user
  if (!address || address.userId.toString() !== userId.toString()) {
    return next(new ErrorHandler("Invalid or unauthorized address", 404));
  }

  // ✅ Step 8: Initialize variables to calculate total amount and prepare cart item details
  let totalAmount = 0;
  const cartItems = [];

  // ✅ Step 9: Loop through each item in the cart
  for (const item of cart.items) {
    // Fetch the product details using the product ID in each cart item
    const product = await productCollection.findById(item.productId);

    // If product not found in DB, return error
    if (!product) {
      return next(new ErrorHandler(`Product ${item.productId} not found`, 400));
    }

    // Add the product price * quantity to the total amount
    totalAmount += product.salePrice * item.quantity;

    // Prepare the cart item object to store in the order
    cartItems.push({
      productId: product._id,
      title: product.title,
      image: product.image,
      price: product.price,
      quantity: item.quantity,
    });
  }

  // ✅ Step 10: Format the address details to store inside the order
  const addressInfo = {
    addressId: address._id,
    address: address.address,
    city: address.city,
    pincode: address.pincode,
    phone: address.phone,
    notes: address.notes || "", // Optional notes like "leave at gate"
  };

  if (paymentMethod == "online") {
    //! 2) create create_payment_json
    let create_payment_json = {
      intent: "sale", //! sale ==> funds will be transferred immediately
      payer: { payment_method: "paypal" },
      redirect_urls: {
        return_url: "http://localhost:9000/api/v1/shop/orders/capture-payment",
        cancel_url: "http://localhost:5713/success=flase",
      },
      transactions: [
        {
          items_list: {
            items: cartItems.map((item) => ({
              name: item.title,
              sku: item.productId, // stock keeping unit (UNIQUE ID)
              price: item.price.toFixed(2),
              currency: "USD",
              quantity: item.quantity,
            })),
          },
          amount: {
            total: totalAmount.toFixed(2),
            currency: "USD",
          },
          description: "Payment Order",
        },
      ],
    };

    //! 1) initiate the paypal order
    paypal.payment.create(create_payment_json, async (err, payment) => {
      if (err) return next(new ErrorHandler("Payment Failed", 500));
      console.log(payment.id);

      //~ send a approval link for paypal payment
      const approvalLink = payment.links.find((link) => link.rel === "approval_url").href;
      // console.log(approvalLink);

      await orderCollection.create({
        paymentId: payment.id,
        userId,
        cartId,
        cartItems,
        addressInfo,
        paymentMethod,
        totalAmount,
      });

      new ApiResponse(201, true, "Order created successfully", approvalLink).send(res);
    });
  }
  //~ If payment method is COD
  else {
    const newOrder = await orderCollection.create({
      userId,
      cartId,
      cartItems,
      addressInfo,
      paymentMethod,
      totalAmount,
    });
    new ApiResponse(201, true, "Order created successfully", newOrder).send(res);
  }
});

//! http://localhost:9000/api/v1/shop/orders/capture-payment?paymentId=PAYID-NCE6VTA8K212113UM6454648&token=EC-2GS68758TV440830J&PayerID=E8J6GABAN2B7A

const capturePayment = expressAsyncHandler(async (req, res, next) => {
  console.log(req.query);
  let userId = req.user._id;
  const paymentId = req.query.paymentId;
  const payerId = req.query.PayerID;

  paypal.payment.execute(paymentId, { payer_id: payerId }, async (err, payment) => {
    console.log(err);
    if (err) return next(new ErrorHandler("Payment Failed", 500));

    // console.log(payment);
    let order = await orderCollection.findOne({ paymentId });
    console.log(order);

    if (payment.state === "approved") {
      order.orderStatus = "placed";
      order.paymentStatus = "paid";
      order.payerId = payerId;
      await order.save();

      //! stock
      let cart = await cartCollection.findOne({ userId });
      cart.items.map(async (item) => {
        await productCollection.updateOne(
          { _id: item.productId },
          { $inc: { totalStock: -item.quantity } }
        );
      });
      //! cart
      cart.items = [];
      await cart.save();

      new ApiResponse(200, true, "Payment captured successfully", order).send(res);
    } else {
      order.status = "cancelled";
      order.paymentStatus = "failed";
      order.payerId = payerId;
      await order.save();
      new ApiResponse(200, true, "Payment failed", order).send(res);
    }
  });
});

const getOrders = expressAsyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const orders = await orderCollection.find({ userId });
  if (orders.length === 0) return next(new ErrorHandler("No orders found", 404));
  new ApiResponse(true, "Orders fetched successfully", orders, 200).send(res);
});

const getOrder = expressAsyncHandler(async (req, res, next) => {
  const orderId = req.params.id;
  const userId = req.user._id;

  const order = await orderCollection.findOne({ _id: orderId, userId });
  if (!order) return next(new ErrorHandler("Order not found", 404));

  new ApiResponse(true, "Order fetched successfully", order, 200).send(res);
});

module.exports = {
  createOrder,
  capturePayment,
  getOrders,
  getOrder,
};
// PAYID-NCE6UPA67T997029E544672F
// http://localhost:9000/api/v1/shop/orders/capture-payment?paymentId=PAYID-NCE6UPA67T997029E544672F&token=EC-3J282401CH949013L&PayerID=E8J6GABAN2B7A
