import dotenv from "dotenv";
import connectDB from "./db/index.js";
import express from "express";
import { app } from "./app.js";

// const app = express();

dotenv.config({
  path: "./env",
});

app.on("error", (err) => {
  console.log(`MongoDB Connection Failed at ./index.js :) ${err}`);
});

connectDB()
  .then(() => {
    app.get("/", (res, rep)=>{
      rep.send("hello  ");
    })
    app.listen(process.env.PORT || 4000, () => {
      console.log(
        `\nApplication is Running on : http://localhost:${process.env.PORT || 4000} :)\n`
      );
    });
  })
  .catch((err) => {
    console.log(`MongoDB Connection Failed at ./index.js :) ${err}\n`);
  });

/*
  import express from "express";
  const app = express();
  (async () => {
    try {
      await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
      app.on("error", (error) => {
        console.log("Error : ", error);
        throw error;
      });

      app.listen(process.env.PORT, () => {
        console.log(`App is listening on Port ${process.env.PORT}`);
      });
    } catch (error) {
      console.error("Error : ", error);
      throw error;
    }
  })();
*/
