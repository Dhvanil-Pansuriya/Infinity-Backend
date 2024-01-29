import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    console.log(
      `\nMongoDB Connected SuccessFully on : ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("MongoDB Connection Error : ", error);
    process.exit(1);
  }
};

export default connectDB;
