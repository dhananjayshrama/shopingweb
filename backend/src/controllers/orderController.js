const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

const STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

// POST /api/orders
exports.createOrder = async (req, res) => {
  try {
    const a = req.body.shippingAddress || {};
    if (!a.address || !a.city || !a.pincode || !a.phone)
      return res
        .status(400)
        .json({ message: "Address, city, pincode and phone are required" });

    const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
    if (!cart || cart.items.length === 0)
      return res.status(400).json({ message: "Cart is empty" });

    const orderItems = [];
    for (const i of cart.items) {
      if (!i.product)
        return res
          .status(400)
          .json({ message: "A product in your cart no longer exists" });
      orderItems.push({
        product: i.product._id,
        name: i.product.name,
        price: i.product.price,
        quantity: i.quantity,
      });
    }

    // Reduce stock safely. If any item is short, undo the earlier ones.
    const reduced = [];
    for (const item of orderItems) {
      const ok = await Product.findOneAndUpdate(
        { _id: item.product, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } }
      );
      if (!ok) {
        for (const d of reduced)
          await Product.findByIdAndUpdate(d.product, { $inc: { stock: d.quantity } });
        return res
          .status(400)
          .json({ message: `Not enough stock for ${item.name}` });
      }
      reduced.push(item);
    }

    const totalPrice = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress: a,
      totalPrice,
    });

    cart.items = [];
    await cart.save();

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/orders/my
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/orders/:id  (owner or admin)
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("user", "name email");
    if (!order) return res.status(404).json({ message: "Order not found" });

    const isOwner = order.user._id.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "admin")
      return res.status(403).json({ message: "Not allowed" });

    res.json(order);
  } catch (err) {
    res.status(400).json({ message: "Invalid order id" });
  }
};

// GET /api/orders  (admin)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/orders/:id/status  (admin)
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!STATUSES.includes(status))
      return res
        .status(400)
        .json({ message: `Status must be one of: ${STATUSES.join(", ")}` });

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(400).json({ message: "Invalid order id" });
  }
};