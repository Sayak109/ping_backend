import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongoURL = process.env.MONGO_URL as string;
    
    if (!mongoURL) {
      throw new Error("MONGO_URL is not defined in environment variables");
    }

    await mongoose.connect(mongoURL, {
      // Add connection timeout
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log("Database connected successfully.");
  } catch (error) {
    console.error("Failed to connect database:", error);
    // Don't throw error, just log it so the server can still start
    console.log("Server will continue without database connection.");
  }
};

export default connectDB;
