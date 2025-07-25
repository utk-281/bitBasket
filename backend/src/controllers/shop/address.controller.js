const addressCollection = require("../../models/address.models");
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
  new ApiResponse(201, true, "Address added successfully", newAddress).send(res);
});

const getAddresses = expressAsyncHandler(async (req, res) => {
  const userId = req.user._id;
  const addresses = await addressCollection.find({ userId });
  if (addresses.length === 0) return next(new ErrorHandler("No addresses found", 404));
  new ApiResponse(200, true, "Addresses fetched successfully", addresses).send(res);
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
  new ApiResponse(200, true, "Address updated successfully", updatedAddress).send(res);
});

const deleteAddress = expressAsyncHandler(async (req, res) => {
  const userId = req.user._id;
  const addressId = req.params.id;
  const deletedAddress = await addressCollection.findOneAndDelete({ userId, _id: addressId });
  if (!deletedAddress) return next(new ErrorHandler("Address not found", 404));
  new ApiResponse(200, true, "Address deleted successfully").send(res);
});

const getAddress = expressAsyncHandler(async (req, res) => {
  const userId = req.user._id;
  const addressId = req.params.id;
  const address = await addressCollection.findOne({ userId, _id: addressId });
  if (!address) return next(new ErrorHandler("Address not found", 404));
  new ApiResponse(200, true, "Address fetched successfully", address).send(res);
});

module.exports = { addAddress, getAddresses, deleteAddress, getAddress, editAddress };
