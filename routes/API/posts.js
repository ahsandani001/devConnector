const express = require("express");
const router = express.Router();

router.get("/", (req, res) => res.json({ msg: "posts routes works" }));

module.exports = router;
