// api/routes/email.Routes.ts
import { Router } from "express";
import { getEmails, sendEmail } from "../controllers/emailController";
import { jwtAuth } from "../middlewares/jwtAuth";

const router = Router();

router.get("/emails", jwtAuth, getEmails);
router.post("/emails", jwtAuth, sendEmail);

export default router;
