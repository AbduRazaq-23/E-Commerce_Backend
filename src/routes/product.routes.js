import { Router } from "express";
const router = Router();

import {
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getNewProducts,
  getProductsBySearch,
  addProductReview,
  addCommentToProducts,
} from "../controllers/product.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { isAdmin } from "../middlewares/auth.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

router
  .route("/")
  .post(verifyJWT, isAdmin, upload.single("image"), createProduct)
  .get(getAllProducts);

router
  .route("/:productId")
  .patch(verifyJWT, isAdmin, upload.single("image"), updateProduct)
  .delete(verifyJWT, isAdmin, deleteProduct);

router.route("/new").get(getNewProducts);
router.route("/search").get(getProductsBySearch);
router.route("/review/:productId").post(verifyJWT, addProductReview);
router.route("/comments/:productId").post(verifyJWT, addCommentToProducts);

export default router;
