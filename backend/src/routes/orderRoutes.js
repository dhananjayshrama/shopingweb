const router = require("express").Router();
const {
  createOrder,
  getMyOrders,
  getOrder,
  getAllOrders,
  updateStatus,
} = require("../controllers/orderController");
const { protect } = require("../middleware/auth");
const { admin } = require("../middleware/admin");

router.use(protect);

router.post("/", createOrder);
router.get("/my", getMyOrders); // must come before "/:id"
router.get("/", admin, getAllOrders);
router.get("/:id", getOrder);
router.put("/:id/status", admin, updateStatus);

module.exports = router;