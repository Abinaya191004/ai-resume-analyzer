const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      console.warn("No MONGO_URI provided — skipping MongoDB connection in dev.");
      return;
    }
    await mongoose.connect(uri);
    console.log("MongoDB Connected ✅");
  } catch (error) {
    console.error("MongoDB Connection Failed ❌");
    console.error(error.message);
    // Do not exit process in development; allow the server to continue running
    if (process.env.NODE_ENV === 'production') process.exit(1);
  }
};

module.exports = connectDB;
