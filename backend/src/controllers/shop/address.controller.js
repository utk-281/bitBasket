const addressCollection = require("../../models/address.model");
const ApiResponse = require("../../utils/ApiResponse.utils");
const ErrorHandler = require("../../utils/ErrorHandler.utils");
const expressAsyncHandler = require("express-async-handler");

const addAddress = expressAsyncHandler(async (req, res) => {
  const { address, city, pincode, phone, notes } = req.body;
  const userId = req.user._id;
  const newAddress = await addressCollection.create({
    userId,
    address,
    city,
    pincode,
    phone,
    notes,
  });
  new ApiResponse(true, "Address added successfully", newAddress, 201).send(res);
});

const getAddresses = expressAsyncHandler(async (req, res) => {
  const userId = req.user._id;
  const addresses = await addressCollection.find({ userId });
  if (addresses.length === 0) return next(new ErrorHandler("No addresses found", 404));
  new ApiResponse(true, "Addresses fetched successfully", addresses, 200).send(res);
});

const editAddress = expressAsyncHandler(async (req, res) => {
  const userId = req.user._id;
  const addressId = req.params.id;
  const updatedAddress = await addressCollection.findOneAndUpdate(
    { userId, _id: addressId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!updatedAddress) return next(new ErrorHandler("Address not found", 404));
  new ApiResponse(true, "Address updated successfully", updatedAddress, 200).send(res);
});

const deleteAddress = expressAsyncHandler(async (req, res) => {
  const userId = req.user._id;
  const addressId = req.params.id;
  const deletedAddress = await addressCollection.findOneAndDelete({ userId, _id: addressId });
  if (!deletedAddress) return next(new ErrorHandler("Address not found", 404));
  new ApiResponse(true, "Address deleted successfully", deletedAddress, 200).send(res);
});

const getAddress = expressAsyncHandler(async (req, res) => {
  const userId = req.user._id;
  const addressId = req.params.id;
  const address = await addressCollection.findOne({ userId, _id: addressId });
  if (!address) return next(new ErrorHandler("Address not found", 404));
  new ApiResponse(true, "Address fetched successfully", address, 200).send(res);
});

module.exports = { addAddress, getAddresses, deleteAddress, getAddress, editAddress };
