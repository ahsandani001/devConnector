const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const gravatar = require("gravatar");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const passport = require("passport");

// Load input validations
const validateRegisterInput = require("../../validations/register");
const validateLoginInput = require("../../validations/login");

// @route   GET api/users/test
// @desc    Test user route
// @access  Public
router.get("/test", (req, res) => res.json({ msg: "user routes works" }));

// @route   POST api/users/register
// @desc    Register User
// @access  Public
router.post("/register", async (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);

  // Check validation
  if (!isValid) {
    // console.log(errors);
    return res.status(400).json(errors);
  }

  // 1) find user email
  const user = await User.findOne({ email: req.body.email });
  if (user) {
    errors.email = "Email already exists. Please try a new one";
    return res.status(200).json(errors);
  } else {
    const avatar = gravatar.url(req.body.email, {
      s: "200",
      r: "pg",
      d: "mm",
    });
    // 2) Create a new User
    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      avatar,
      password: req.body.password,
    });

    await newUser.save();

    return res.status(200).json({ user: newUser });
  }
});

// @route   GET api/users/login
// @desc    Login User / Returning JWT Token
// @access  Public
router.post("/login", async (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);

  // Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const { email, password } = req.body;

  // Find user by email
  const user = await User.findOne({ email });

  // Check for user
  if (!user) {
    errors.email = "User not found";
    return res.status(404).json(errors);
  }

  // Check Password
  const passCheck = await user.comparePassword(password, user.password);
  //   console.log(passCheck);

  if (!passCheck) {
    errors.password = "Password Incorrect";
    return res.status(400).json(errors);
  }

  // Sign token
  const payload = { id: user._id, name: user.name, avatar: user.avatar };

  const token = jwt.sign(payload, keys.JWtSecret, {
    expiresIn: 3600,
  });

  return res.status(200).json({ user, token: `Bearer ${token}` });
});

// @route   GET api/users/current
// @desc    Return current user
// @access  Private
router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json({ id: req.user.id, name: req.user.name, email: req.user.email });
  }
);

module.exports = router;
