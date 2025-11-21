import { Router } from "express";
import { AuthController } from "../controllers/authController.js";

const router: Router = Router();

// Authenticate with mail server
router.post("/authenticate", AuthController.authenticateMail);

// Get supported mail providers
router.get("/providers", AuthController.getSupportedProviders);

// Logout from mail server
router.post("/logout", AuthController.logout);

export default router;
