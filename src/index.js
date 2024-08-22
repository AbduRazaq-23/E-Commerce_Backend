import app from "./app.js";
import dotenv from "dotenv";
import { connectDB } from "./db/dbConnect.js";

dotenv.config();

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 5000, () => {
      console.log(`app is running at port : ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.message("error while running : ", error);
  });
