const userCollection = require("../src/models/user.models");
const expressAsyncHandler = require("express-async-handler");

const seedAdmin = expressAsyncHandler(async (req, res) => {
  const admin = await userCollection.findOne({ role: "admin" });
  if (!admin) {
    const adminDetails = {
      userName: "admin",
      email: "admin@gmail.com",
      password: "admin123",
      role: "admin",
    };
    await userCollection.create(adminDetails);
    console.log("admin seeded successfully");
  } else {
    console.log("Admin already exists, skipping seed.");
  }
});

module.exports = { seedAdmin };
