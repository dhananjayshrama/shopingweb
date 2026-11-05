const router = require("express").Router();
const {
  getCart,
  addToCart,
  updateItem,
  removeItem,
  clearCart,
} = require("../controllers/cartController");
const { protect } = require("../middleware/auth");

router.use(protect); // every cart route needs login

router.get("/", getCart);
router.post("/", addToCart);
router.delete("/", clearCart);
router.put("/:productId", updateItem);
router.delete("/:productId", removeItem);

module.exports = router;