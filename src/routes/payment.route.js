import { Router } from "express";

const router = Router();
import { paymentGateWay } from "../controllers/payment.controller.js";

router.route("/pay").post(paymentGateWay);

export default router;
