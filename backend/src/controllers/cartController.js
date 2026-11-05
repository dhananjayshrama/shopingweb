const Cart = require("../models/Cart");
const Product = require("../models/Product");

const getOrCreateCart = async (userId) =>
  (await Cart.findOne({ user: userId })) ||
  (await Cart.create({ user: userId, items: [] }));

const sendCart = async (cart, res) => {
  await cart.populate("items.product");
  res.json(cart);
};

// GET /api/cart
exports.getCart = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user._id);
    await sendCart(cart, res);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/cart   body: { productId, quantity }
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const qty = Number(quantity);
    if (!productId || !Number.isInteger(qty) || qty < 1)
      return res.status(400).json({ message: "Valid productId and quantity required" });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const cart = await getOrCreateCart(req.user._id);
    const item = cart.items.find((i) => i.product.toString() === productId);
    const newQty = (item ? item.quantity : 0) + qty;

    if (newQty > product.stock)
      return res.status(400).json({ message: `Only ${product.stock} in stock` });

    if (item) item.quantity = newQty;
    else cart.items.push({ product: productId, quantity: qty });

    await cart.save();
    await sendCart(cart, res);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT /api/cart/:productId   body: { quantity }
exports.updateItem = async (req, res) => {
  try {
    const qty = Number(req.body.quantity);
    if (!Number.isInteger(qty) || qty < 0)
      return res.status(400).json({ message: "Valid quantity required" });

    const cart = await getOrCreateCart(req.user._id);
    const item = cart.items.find((i) => i.product.toString() === req.params.productId);
    if (!item) return res.status(404).json({ message: "Item not in cart" });

    if (qty === 0) {
      cart.items = cart.items.filter((i) => i !== item);
    } else {
      const product = await Product.findById(req.params.productId);
      if (product && qty > product.stock)
        return res.status(400).json({ message: `Only ${product.stock} in stock` });
      item.quantity = qty;
    }

    await cart.save();
    await sendCart(cart, res);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE /api/cart/:productId
exports.removeItem = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user._id);
    cart.items = cart.items.filter((i) => i.product.toString() !== req.params.productId);
    await cart.save();
    await sendCart(cart, res);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE /api/cart
exports.clearCart = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user._id);
    cart.items = [];
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};