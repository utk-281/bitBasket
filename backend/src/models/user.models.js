const mongoose = require("mongoose");
const validator = require("validator");
const bcryptjs = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 20,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [5, "Email must be at least 5 characters"],
      maxlength: [40, "Email must be at most 40 characters"],
      validate: {
        validator: function (email) {
          return validator.isEmail(email);
        },
      },
    },
    password: {
      type: String,
      required: true,
      minlength: [5, "Password must be at least 5 characters"],
      select: false, // Do not return password in queries
    },
    role: {
      type: String,
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);

//& ─── password encryption ────────────────────────────────────────────────────────────────
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    // Check if password is modified if not, skip hashing
    return next();
  }
  let salt = await bcryptjs.genSalt(12);
  let hashedPassword = await bcryptjs.hash(this.password, salt);
  this.password = hashedPassword;
  next();
});

//& ─── compare password ────────────────────────────────────────────────────────────────
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcryptjs.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
