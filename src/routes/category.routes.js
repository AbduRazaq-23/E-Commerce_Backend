import { Router } from "express";
const router = Router();

import {
  createCategory,
  updateCategory,
  deleteCategroy,
  listOfCategroy,
} from "../controllers/category.controller.js";

router.route("/").post(createCategory);
router.route("/:categoryId").patch(updateCategory);
router.route("/:categoryId").delete(deleteCategroy);
router.route("/getcategory").get(listOfCategroy);

export default router;
