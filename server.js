// Importing
const express = require("express");
const mongoose = require("mongoose");
const db = require("./config/keys");
const users = require("./routes/API/users");
const posts = require("./routes/API/posts");
const profile = require("./routes/API/profile");

// App Config
const app = express();

// Middlewares
app.use(express.json());

// DB
mongoose
  .connect(db.mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("DB Connected"))
  .catch((err) => console.log(err));

// Use Routes
app.use("/api/users", users);
app.use("/api/profile", profile);
app.use("/api/posts", posts);
// API Routes
app.get("/", (req, res) => res.send("Hello World!"));

// Server Listening
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));
