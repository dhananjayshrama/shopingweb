const User = require("../models/User");

// GET /api/wishlist: my saved products
exports.getWishlist = async (req, res) => {
  const user = await User.findById(req.user._id).populate("wishlist");
  res.json(user.wishlist);
};

// POST /api/wishlist/:productId: save or unsave
exports.toggleWishlist = async (req, res) => {
  const user = await User.findById(req.user._id);
  const id = req.params.productId;
  const exists = user.wishlist.some((p) => p.toString() === id);
  if (exists) user.wishlist.pull(id);
  else user.wishlist.push(id);
  await user.save();
  res.json({ saved: !exists });
};