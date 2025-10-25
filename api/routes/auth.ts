import { Router } from "express";
import { auth } from "../auth";

const router = Router();

// Better Auth routes
router.all("/auth/*", auth.handler);

export default router;
