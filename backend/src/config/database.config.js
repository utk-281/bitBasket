const mongoose = require("mongoose");

const connectDB = async () => {
  let client = await mongoose.connect(process.env.MONGODB_LOCAL_URL);
  console.log(`MongoDB connected to ${client.connection.host}`);
};

module.exports = connectDB;
