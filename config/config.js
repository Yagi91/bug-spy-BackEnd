require("dotenv").config();
const config = {
  env: process.env.NODE_ENV || "development",
  port: process.env.PORT || 5000,
  jwtSecret: process.env.JWT_SECRET || "YOUR_secret_key",
  mongoUri:
    process.env.MONGODB_URI ||
    process.env.MONGO_HOST ||
    "mongodb://" +
      (process.env.IP || "localhost") +
      ":" +
      (process.env.MONGO_PORT || "27017") +
      "/bug-spy",
};

// 'mongodb+srv://bryantimah:XnAAMKNFIVLpuMt8@cluster0.uc3i8ea.mongodb.net/?retryWrites=true&w=majority'

module.exports = config;