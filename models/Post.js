const mongoose = require("mongoose");

const PostSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "users",
  },
  text: {
    type: String,
    required: true,
  },
  name: String,
  avatar: String,
  likes: [
    {
      user: { type: mongoose.Schema.ObjectId, ref: "users" },
    },
  ],
  comments: [
    {
      user: { type: mongoose.Schema.ObjectId, ref: "users" },
      text: { type: String, required: true },
      name: { type: String },
      avatar: { type: String },
      date: { type: Date, default: Date.now },
    },
  ],
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("post", PostSchema);
