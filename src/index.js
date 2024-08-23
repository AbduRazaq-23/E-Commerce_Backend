import dotenv from "dotenv";
dotenv.config({
  path: "./.env",
});

import app from "./app.js";
import { connectDB } from "./db/dbConnect.js";

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 5000, () => {
      console.log(`app is running at port : ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.message("error while running : ", error);
  });
