const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.get("/", (req, res) => {
  res.send("InsightCart AI Backend Running 🚀");
});

app.use("/api/test", require("./routes/test.route"));
app.use("/api/auth", require("./routes/auth.route"));
app.use("/api/products", require("./routes/product.route"));
app.use("/api/cart", require("./routes/cart.route"));



const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
