const expressAsyncHandler = require("express-async-handler");
const v2 = require("../config/cloudinary.config");

const uploadImageOnCloudinary = expressAsyncHandler(async (path) => {
  let uploaded = await v2.uploader.upload(path, { folder: "eKart", resource_type: "auto" });
  console.log(uploaded);
  return uploaded;
});

module.exports = uploadImageOnCloudinary;
