import { Router } from "express";
import { auth } from "../auth";

const router = Router();

// Better Auth routes
router.all("/api/auth/*", auth.handler);

export default router;
