const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");
const Profile = require("../../models/Profile");
const User = require("../../models/User");
const validateProfileInput = require("../../validations/profile");
const validateExperienceInput = require("../../validations/experience");
const validateEducationInput = require("../../validations/education");

// @route   GET api/profile/test
// @desc    Test profile route
// @access  Public
router.get("/test", (req, res) => res.json({ msg: "profile routes works" }));

// @route   GET api/profile
// @desc    Get current users profile
// @access  Private
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const errors = {};
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate("user", ["name", "avatar"]);

    if (!profile) {
      errors.noprofile = "There is no profile for this user";
      return res.status(404).json(errors);
    }
    res.status(200).json(profile);
  }
);

// @route   GET api/profile/all
// @desc    Get all profiles
// @access  public
router.get("/all", async (req, res) => {
  const errors = {};
  const profiles = await Profile.find().populate("user", ["name", "avatar"]);
  if (!profiles) {
    errors.profile = "There are no profiles";
    return res.status(404).json(errors);
  }
  return res.status(200).json(profiles);
});

// @route   GET api/profile/handle/:handle
// @desc    Get profile by handle
// @access  public
router.get("/handle/:handle", async (req, res) => {
  const errors = {};

  const profile = await Profile.findOne({
    handle: req.params.handle,
  }).populate("user", ["name", "avatar"]);

  if (!profile) {
    errors.profile = "There is no profile for this user.";
    res.status(404).json(errors);
  }

  res.status(200).json(profile);
});

// @route   GET api/profile/user/:user_id
// @desc    Get profile by user ID
// @access  Public
router.get("/user/:user_id", async (req, res) => {
  const errors = {};

  const profile = await Profile.findOne({
    user: req.params.user_id,
  }).populate("user", ["name", "avatar"]);

  if (!profile) {
    errors.profile = "There is no profile for this user.";
    res.status(404).json(errors);
  }

  res.status(200).json(profile);
});

// @route   POST api/profile
// @desc    Create or edit users profile
// @access  Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    // Validate
    const { errors, isValid } = validateProfileInput(req.body);

    // Check validations
    if (!isValid) {
      // Return any errors
      return res.status(400).json(errors);
    }

    // Get fields
    const profileFields = {};
    profileFields.user = req.user.id;

    if (req.body.handle) profileFields.handle = req.body.handle;
    if (req.body.company) profileFields.company = req.body.company;
    if (req.body.website) profileFields.website = req.body.website;
    if (req.body.location) profileFields.location = req.body.location;
    if (req.body.bio) profileFields.bio = req.body.bio;
    if (req.body.status) profileFields.status = req.body.status;
    if (req.body.githubusername)
      profileFields.githubusername = req.body.githubusername;
    // Skills - split into array
    if (typeof req.body.skills !== "undefined") {
      profileFields.skills = req.body.skills.split(",");
    }

    // Socials
    profileFields.social = {};
    if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
    if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
    if (req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
    if (req.body.facebook) profileFields.social.facebook = req.body.facebook;
    if (req.body.instagram) profileFields.social.instagram = req.body.instagram;

    const profile = await Profile.findOne({ user: req.user.id });
    if (profile) {
      // Update
      await Profile.findOneAndUpdate(
        { user: req.user.id },
        { $set: profileFields },
        { new: true }
      ).then((profile) => res.status(200).json(profile));
    } else {
      // Create

      // Check if handle exists
      await Profile.findOne({ handle: profileFields.handle }).then(
        (profile) => {
          if (profile) {
            errors.handle = "That handle already exists";
            res.status(400).json(errors);
          }

          // Save profile
          new Profile(profileFields)
            .save()
            .then((profile) => res.status(200).json(profile));
        }
      );
    }
  }
);

// @route   POST api/profile/experience
// @desc    Add experience in profile
// @access  Private
router.post(
  "/experience",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    // Validate
    const { errors, isValid } = validateExperienceInput(req.body);

    // Check validations
    if (!isValid) {
      // Return any errors
      return res.status(400).json(errors);
    }

    const profile = await Profile.findOne({ user: req.user.id });
    const newExp = {
      title: req.body.title,
      company: req.body.company,
      location: req.body.location,
      from: req.body.from,
      to: req.body.to,
      current: req.body.current,
      description: req.body.description,
    };

    // Add to exp array
    profile.experience.unshift(newExp);
    await profile.save();

    res.status(200).json(profile);
  }
);

// @route   POST api/profile/education
// @desc    Add education in profile
// @access  Private
router.post(
  "/education",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    // Validate
    const { errors, isValid } = validateEducationInput(req.body);

    // Check validations
    if (!isValid) {
      // Return any errors
      return res.status(400).json(errors);
    }

    const profile = await Profile.findOne({ user: req.user.id });
    const newEdu = {
      school: req.body.school,
      degree: req.body.degree,
      fieldofstudy: req.body.fieldofstudy,
      from: req.body.from,
      to: req.body.to,
      current: req.body.current,
      description: req.body.description,
    };

    // Add to edu array
    profile.education.unshift(newEdu);
    await profile.save();

    res.status(200).json(profile);
  }
);

// @route   Delete api/profile/experience/:exp_id
// @desc    Delete experience from profile
// @access  Private
router.delete(
  "/experience/:exp_id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const profile = await Profile.findOne({ user: req.user.id });

    // Get remove index
    const removeIndex = profile.experience
      .map((item) => item.id)
      .indexOf(req.params.exp_id);

    // Splice out of array
    profile.experience.splice(removeIndex, 1);

    // Save
    await profile.save();

    res.status(200).json(profile);
  }
);

// @route   Delete api/profile/education/:edu_id
// @desc    Delete education from profile
// @access  Private
router.delete(
  "/education/:edu_id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const profile = await Profile.findOne({ user: req.user.id });

    // Get remove index
    const removeIndex = profile.education
      .map((item) => item.id)
      .indexOf(req.params.edu_id);

    // Splice out of array
    profile.education.splice(removeIndex, 1);

    // Save
    await profile.save();

    res.status(200).json(profile);
  }
);

// @route   Delete api/profile
// @desc    Delete user and profile
// @access  Private
router.delete(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const profile = await Profile.findOneAndRemove({ user: req.user.id });

    await User.findOneAndRemove({ _id: req.user.id });

    res
      .status(200)
      .json({ message: "Profile and user has been deleted successfully" });
  }
);

module.exports = router;
