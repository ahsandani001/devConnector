const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");
const Post = require("../../models/Post");
const Profile = require("../../models/Profile");
const validatePostInput = require("../../validations/post");

router.get("/test", (req, res) => res.json({ msg: "posts routes works" }));

router.get('ping', (req, res) => res.json({message: 'pong'}));

// @route   Get api/posts
// @desc    Get Posts
// @access  Public
router.get("/", async (req, res) => {
  const posts = await Post.find().sort({ date: -1 });

  if (!posts) return res.status(404).json({ message: "No posts found." });

  return res.status(200).json(posts);
});

// @route   Get api/posts/:id
// @desc    Get Post by id
// @access  Public
router.get("/:id", async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post)
    return res.status(404).json({ message: "No post found with that id." });

  return res.status(200).json(post);
});

// @route   Post api/posts
// @desc    Create post
// @access  Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    if (!isValid) {
      return res.status(400).json(errors);
    }

    const newPost = new Post({
      text: req.body.text,
      name: req.body.name,
      avatar: req.body.avatar,
      user: req.user.id,
    });

    await newPost.save();

    return res.status(200).json(newPost);
  }
);

// @route   Delete api/posts/:id
// @desc    Delete the post
// @access  Private
router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(200).json({ message: "Post not found" });

    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ notauthorized: "User not authorized" });
    }

    await post.remove();

    return res.status(200).json({ message: "Post deleted successfully" });
  }
);

// @route   Post api/posts/like/:post_id
// @desc    Like post
// @access  Private
router.post(
  "/like/:post_id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const post = await Post.findById(req.params.post_id);

    if (!post) return res.status(200).json({ message: "Post not found" });

    if (
      post.likes.filter((item) => item.user.toString() === req.user.id).length >
      0
    ) {
      return res
        .status(400)
        .json({ message: "You have already liked this post" });
    }

    // Add user id to likes array
    post.likes.unshift({ user: req.user.id });

    await post.save();

    return res.status(200).json({ post });
  }
);

// @route   Post api/posts/unlike/:post_id
// @desc    Unlike post
// @access  Private
router.post(
  "/unlike/:post_id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const post = await Post.findById(req.params.post_id);

    if (!post) return res.status(200).json({ message: "Post not found" });

    if (
      post.likes.filter((item) => item.user.toString() === req.user.id)
        .length === 0
    ) {
      return res
        .status(400)
        .json({ message: "You have not yet liked this post" });
    }

    // Get remove index
    const removeIndex = post.likes
      .map((item) => item.user.toString())
      .indexOf(req.user.id);
    post.likes.splice(removeIndex, 1);
    await post.save();

    return res.status(200).json({ post });
  }
);

// @route   Post api/posts/comment/:post_id
// @desc    Add comment to post
// @access  Private
router.post(
  "/comment/:post_id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    if (!isValid) {
      return res.status(400).json(errors);
    }

    const post = await Post.findById(req.params.post_id);
    // console.log(post);
    if (!post)
      return res.status(404).json({ message: "No post found with that id." });

    const newComment = {
      text: req.body.text,
      name: req.body.name,
      avatar: req.body.avatar,
      user: req.user.id,
    };

    // Add to comment array
    post.comments.unshift(newComment);

    await post.save();

    return res.status(200).json(post);
  }
);

// @route   Delete api/posts/comment/:post_id/:comment_id
// @desc    Remove comment from post
// @access  Private
router.delete(
  "/comment/:post_id/:comment_id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const post = await Post.findById(req.params.post_id);

    if (!post)
      return res.status(404).json({ message: "No post found with that id." });

    // Check to see if comment exist
    if (
      post.comments.filter(
        (comment) => comment._id.toString() === req.params.comment_id
      ).length === 0
    ) {
      return res.status(404).json({ message: "Comment does not exist" });
    }

    const removeIndex = post.comments.map(
      (comment) => comment._id.toString() === req.params.comment_id
    );

    post.comments.splice(removeIndex, 1);

    post.save();

    return res.status(200).json(post);
  }
);

module.exports = router;
