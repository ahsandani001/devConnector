const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");

const userSchema = mongoose.Schema({
  name: {
    type: "String",
    required: true,
  },
  email: {
    type: "String",
    required: true,
  },
  password: {
    type: "String",
    required: true,
  },
  avatar: {
    type: "String",
  },
  date: {
    type: Date,
    default: Date.now(),
  },
});

// Middleware to save password in hash
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = (plainPass, hashPass) => {
  return bcrypt.compare(plainPass, hashPass);
};

userSchema.pre("save", function (next) {
  // console.log(`name: ${this.name} || email: ${this.email}`);
  validator.isEmpty(this.email);
  validator.isEmail(this.email);
  next();
});

module.exports = mongoose.model("users", userSchema);
