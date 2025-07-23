const expressAsyncHandler = require("express-async-handler"); // Imports a utility to wrap async express route handlers, catching errors and passing them to the error middleware.
const cartCollection = require("../../models/cart.models"); // Imports the Mongoose model for the cart.
const productCollection = require("../../models/product.models"); // Imports the Mongoose model for products.
const ApiResponse = require("../../utils/ApiResponse.utils"); // Imports a custom utility for consistent API response formatting.
const ErrorHandler = require("../../utils/ErrorHandler.utils"); // Imports a custom utility for handling errors and sending appropriate HTTP responses.

//& ─── Add To Cart ───────────────────────────────────────────────────────────────
/**
 * @desc Add a product to the user's cart or increment its quantity if already present.
 * @route POST /api/v1/cart/add
 * @access Private (requires user authentication)
 */
const addToCart = expressAsyncHandler(async (req, res, next) => {
  const userId = req.user._id; // Extracts the authenticated user's ID from the request object. This assumes `req.user` is populated by an authentication middleware.
  const { productId } = req.body; // Extracts the productId from the request body.

  // Find the product in the database to ensure it exists.
  const product = await productCollection.findById(productId);
  // If the product is not found, send a 404 error.
  if (!product) return next(new ErrorHandler("Product not found", 404));

  // Find the user's cart.
  let cart = await cartCollection.findOne({ userId });
  // If no cart exists for the user, create a new one with an empty items array.
  if (!cart) {
    cart = await cartCollection.create({ userId, items: [] });
  }

  // Check if the product already exists in the cart.
  // The `findIndex` method is used to get the index of the item if its productId matches the one being added.
  // `item.productId.toString()` is used to compare ObjectId with the string productId from req.body.
  const index = cart.items.findIndex((item) => item.productId.toString() === productId);

  // If the product is not found in the cart (index is -1), add it as a new item with quantity 1.
  if (index === -1) {
    cart.items.push({ productId, quantity: 1 });
  } else {
    // If the product is already in the cart, increment its quantity by 1.
    cart.items[index].quantity += 1;
  }

  // Save the updated cart to the database.
  await cart.save();
  // Send a success API response with the updated cart data.
  new ApiResponse(201, true, "Product added successfully").send(res);
});

//& ─── Fetch Cart Items ──────────────────────────────────────────────────────────
/**
 * @desc Fetch all items in the user's cart.
 * @route GET /api/v1/cart
 * @access Private (requires user authentication)
 */
const fetchCartItems = expressAsyncHandler(async (req, res, next) => {
  const userId = req.user._id; // Extracts the authenticated user's ID.

  // Find the user's cart and populate the `productId` field in `items` array.
  // `populate` replaces the `productId` ObjectId with the actual product document from `productCollection`.
  // `select` specifies which fields from the product document to include (`image`, `title`, `price`, `salePrice`).
  const cart = await cartCollection.findOne({ userId }).populate({
    path: "items.productId",
    select: "image title price salePrice brand",
  });

  // If no cart is found for the user, send a 404 error.
  if (!cart) return next(new ErrorHandler("Cart not found", 404));

  // Filter out any cart items where the `productId` might have become null (e.g., if a product was deleted from the database).
  const validItems = cart.items.filter((item) => item.productId);

  // If some items were invalid (product no longer exists), update the cart in the database to remove them.
  if (validItems.length < cart.items.length) {
    cart.items = validItems;
    await cart.save();
  }

  // Map the valid cart items to a new array with flattened product details.
  // This extracts specific product fields directly into the cart item object for easier consumption by the client.
  const populateCartItems = validItems.map((item) => ({
    productId: item.productId._id,
    quantity: item.quantity,
    title: item.productId.title,
    image: item.productId.image,
    price: item.productId.price,
    salePrice: item.productId.salePrice,
  }));

  // Create a new object for the API response, combining cart details with the populated items and an `isEmpty` flag.
  const cartItems = {
    ...cart.toObject(), // Converts the Mongoose document to a plain JavaScript object.
    items: populateCartItems, // Replaces the original `items` array with the populated one.
    isEmpty: populateCartItems.length === 0, // A boolean flag indicating if the cart is empty.
  };

  // Determine the response message based on whether the cart is empty.
  const message =
    populateCartItems.length === 0 ? "Cart is empty" : "Cart items fetched successfully";
  // Send a success API response with the formatted cart data.
  new ApiResponse(200, true, message, cartItems).send(res);
});

// ─── Update Cart Items ─────────────────────────────────────────────────────────
/**
 * @desc Update the quantity of a product in the user's cart (specifically, decrease by 1).
 * @route PUT /api/v1/cart/update
 * @access Private (requires user authentication)
 */
const updateCartItems = expressAsyncHandler(async (req, res, next) => {
  const userId = req.user._id; // Extracts the authenticated user's ID.
  const { productId } = req.body; // Extracts the productId from the request body.

  // Find the user's cart.
  const cart = await cartCollection.findOne({ userId });
  // If no cart is found, send a 404 error.
  if (!cart) return next(new ErrorHandler("Cart not found", 404));

  // Find the index of the product in the cart's items array.
  // Both `productId` are converted to string for reliable comparison.
  const index = cart.items.findIndex((item) => item.productId.toString() === productId.toString());
  // If the product is not found in the cart, send a 404 error.
  if (index === -1) {
    return next(new ErrorHandler("Product not found in cart", 404));
  }

  // Decrease the quantity of the found item by 1.
  cart.items[index].quantity -= 1;

  // Optional: If the quantity becomes 0 or less, remove the item entirely from the cart.
  if (cart.items[index].quantity <= 0) {
    cart.items.splice(index, 1); // Removes 1 element starting from the `index`.
  }

  // Save the updated cart to the database.
  await cart.save();

  // Re-populate the cart items after saving to get the latest product details.
  // This is crucial if the client needs updated product info immediately after a quantity change.
  await cart.populate({
    path: "items.productId",
    select: "image title price salePrice",
  });

  // Re-filter valid items in case any products were deleted while the cart was being updated.
  const validItems = cart.items.filter((item) => item.productId);
  // If there are invalid items, update the cart to reflect only valid ones.
  if (validItems.length < cart.items.length) {
    cart.items = validItems;
    await cart.save();
  }

  // Map the valid items to a flattened structure, handling cases where product details might be missing.
  const populateCartItems = validItems.map((item) => ({
    productId: item.productId?._id || null, // Use optional chaining to safely access _id.
    quantity: item.quantity || 0, // Default to 0 if quantity is undefined.
    title: item.productId?.title || "Product not found", // Default title if product is missing.
    image: item.productId?.image || null,
    price: item.productId?.price || 0,
    salePrice: item.productId?.salePrice || 0,
  }));

  // Construct the final cart object for the API response.
  const cartItems = {
    ...cart.toObject(),
    items: populateCartItems,
    isEmpty: populateCartItems.length === 0,
  };

  // Send a success API response with the updated cart data.
  new ApiResponse(200, true, "Product quantity updated successfully", cartItems).send(res);
});

// ─── Delete Cart Item ──────────────────────────────────────────────────────────
/**
 * @desc Delete a specific product from the user's cart.
 * @route DELETE /api/v1/cart/:productId
 * @access Private (requires user authentication)
 */
const deleteCartItem = expressAsyncHandler(async (req, res, next) => {
  const userId = req.user._id; // Extracts the authenticated user's ID.
  const { productId } = req.params; // Extracts the productId from the URL parameters.

  // Find the user's cart and populate product details, similar to `fetchCartItems`.
  const cart = await cartCollection.findOne({ userId }).populate({
    path: "items.productId",
    select: "image title price salePrice",
  });

  // If no cart is found, send a 404 error.
  if (!cart) return next(new ErrorHandler("Cart not found", 404));

  // Find the index of the item to be deleted.
  // It checks if `item.productId` exists and its `_id` matches the `productId` from params.
  const index = cart.items.findIndex(
    (item) => item.productId && item.productId._id.toString() === productId
  );
  // If the product is not found in the cart, send a 404 error.
  if (index === -1) {
    return next(new ErrorHandler("Product not found in cart", 404));
  }

  // Remove the item from the cart's items array.
  cart.items.splice(index, 1); // Removes 1 element starting from `index`.
  // Save the modified cart.
  await cart.save();

  // Re-populate the cart items after deletion to ensure the response has up-to-date product details.
  await cart.populate({
    path: "items.productId",
    select: "image title price salePrice",
  });

  // Filter valid items and map them to the flattened structure.
  const validItems = cart.items.filter((item) => item.productId);
  const populateCartItems = validItems.map((item) => ({
    productId: item.productId._id,
    quantity: item.quantity,
    title: item.productId.title,
    image: item.productId.image,
    price: item.productId.price,
    salePrice: item.productId.salePrice,
  }));

  // Construct the final cart object for the API response.
  const cartItems = {
    ...cart.toObject(),
    items: populateCartItems,
    isEmpty: populateCartItems.length === 0,
  };

  // Determine the response message based on whether the cart is now empty.
  const message =
    populateCartItems.length === 0 ? "Cart is now empty" : "Product removed from cart successfully";

  // Send a success API response.
  new ApiResponse(true, message, cartItems, 200).send(res);
});

// ─── Clear Cart ────────────────────────────────────────────────────────────────
/**
 * @desc Clear all items from the user's cart.
 * @route DELETE /api/v1/cart/clear
 * @access Private (requires user authentication)
 */
const clearCart = expressAsyncHandler(async (req, res, next) => {
  const userId = req.user._id; // Extracts the authenticated user's ID.

  // Find the user's cart.
  const cart = await cartCollection.findOne({ userId });
  // If no cart is found, send a 404 error (though arguably, clearing an non-existent cart could still be a success if the goal is an empty cart state).
  if (!cart) return next(new ErrorHandler("Cart not found", 404));

  // Set the `items` array to empty, effectively clearing the cart.
  cart.items = [];
  // Save the empty cart to the database.
  await cart.save();

  // Create an object representing the cleared cart for the API response.
  const emptyCart = {
    ...cart.toObject(),
    items: [], // Explicitly set items to an empty array.
    isEmpty: true, // Mark the cart as empty.
  };

  // Send a success API response.
  new ApiResponse(true, "Cart cleared successfully", emptyCart, 200).send(res);
});

// ─── Exports ───────────────────────────────────────────────────────────────────
// Export all the cart-related controller functions so they can be used by the router.
module.exports = {
  addToCart,
  fetchCartItems,
  updateCartItems,
  deleteCartItem,
  clearCart,
};
