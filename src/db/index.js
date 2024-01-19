import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";
import express from "express";

const app = express();

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    console.log(
      `\n\nMongoDB Connected SuccessFully : ${connectionInstance.connection.host}`
    );
    app.listen(process.env.PORT, () => {
      console.log(
        `\nApplication Listening on http://localhost:${process.env.PORT}\n`
      );
    });
  } catch (error) {
    console.log("MongoDB Connection Error : ", error);
    process.exit(1);
  }
};

export default connectDB;
