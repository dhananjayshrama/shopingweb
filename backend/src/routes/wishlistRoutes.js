const express = require("express");
const { protect } = require("../middleware/auth");
const { getWishlist, toggleWishlist } = require("../controllers/wishlistController");

const router = express.Router();
router.get("/", protect, getWishlist);
router.post("/:productId", protect, toggleWishlist);
module.exports = router;