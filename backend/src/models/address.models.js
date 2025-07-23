const mongoose = require("mongoose");

const AddressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
      minlength: [5, "Address must be at least 5 characters long"],
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
      lowercase: true,
    },
    pincode: {
      type: String,
      required: [true, "Pincode is required"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

module.exports = mongoose.model("Address", AddressSchema);
