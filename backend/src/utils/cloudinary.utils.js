const expressAsyncHandler = require("express-async-handler");
const v2 = require("../config/cloudinary.config");

const getPublicId = (url) => {
  let arr = url.split("/");
  let element = arr[arr.length - 1];
  let id = element.split(".")[0];
  let public_id = "eKart/" + id;
  return public_id;
};

const uploadImageOnCloudinary = expressAsyncHandler(async (path) => {
  let uploaded = await v2.uploader.upload(path, { folder: "eKart", resource_type: "auto" });
  console.log(uploaded);
  return uploaded;
});

const deleteImageFromCloudinary = expressAsyncHandler(async (id) => {
  let response = await v2.uploader.destroy(id);
  return response;
});

module.exports = { uploadImageOnCloudinary, getPublicId, deleteImageFromCloudinary };
