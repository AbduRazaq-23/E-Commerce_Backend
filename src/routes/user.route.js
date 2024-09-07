import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/auth.middleware.js";

const router = Router();

import {
  registerUser,
  logInUser,
  logOutUser,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateAvatar,
  getAllUser,
} from "../controllers/user.controller.js";

router.route("/register").post(upload.single("avatar"), registerUser);
router.route("/logIn").post(logInUser);

//@dec secure route
router.route("/logOut").post(verifyJWT, logOutUser);

router.route("/changePassword").post(verifyJWT, changeCurrentPassword);
router.route("/getcurrentuser").get(verifyJWT, getCurrentUser);
router.route("/updatedetails").patch(verifyJWT, updateAccountDetails);
router
  .route("/updateavatar")
  .patch(verifyJWT, upload.single("avatar"), updateAvatar);
router.route("/getallusers").get(verifyJWT, isAdmin, getAllUser);

export default router;
