const Product = require("../models/Product");

exports.getProducts = async (req, res) => {
  try {
    const { category } = req.query;

    const products = category
      ? await Product.find({ category })
      : await Product.find();

    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

