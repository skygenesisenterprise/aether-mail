import { Router } from "express";
import { AccountController } from "../controllers/accountController.js";

const router: Router = Router();

// Register new user
router.post("/register", AccountController.register);

// Login user
router.post("/login", AccountController.login);

// Get user profile
router.get("/profile", AccountController.getProfile);

export default router;
