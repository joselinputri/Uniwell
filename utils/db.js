const mongoose = require("mongoose");
const dbURI = process.env.MONGO_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(dbURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected.");
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

module.exports = connectDB;