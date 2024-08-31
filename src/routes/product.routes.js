import { Router } from "express";
const router = Router();

import { createProduct } from "../controllers/product.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

router.route("/").post(upload.single("image"), createProduct);

export default router;
