const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      required: [true, "Product image URL is required"],
      trim: true,
    },
    title: {
      type: String,
      required: [true, "Product title is required"],
      lowercase: true,
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [100, "Title can't exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      lowercase: true,
      trim: true,
      minlength: [10, "Description must be at least 10 characters"],
    },
    category: {
      type: String,
      trim: true,
      lowercase: true,
    },
    brand: {
      type: String,
      trim: true,
      lowercase: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    salePrice: {
      type: Number,
      default: 0,
      min: [0, "Sale price cannot be negative"],
    },
    totalStock: {
      type: Number,
      required: [true, "Stock count is required"],
      min: [0, "Stock cannot be negative"],
    },
    averageReview: {
      type: Number,
      default: 0,
      min: [0, "Rating can't be below 0"],
      max: [5, "Rating can't exceed 5"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);
