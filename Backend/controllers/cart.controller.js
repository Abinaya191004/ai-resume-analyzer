const User = require("../models/User");

exports.saveCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { cart } = req.body;

    const user = await User.findById(userId);
    user.cart = cart;
    await user.save();

    res.json({ message: "Cart saved successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate(
      "cart.productId"
    );
    res.json(user.cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
