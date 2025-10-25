import { Router } from "express";
import {
  register,
  login,
  logout,
  saveServerConfig,
} from "../controllers/authController";
import { validateLogin } from "../middlewares/validateMiddleware";

const router = Router();

router.post("/register", register);
import { Request, Response, NextFunction } from "express";

router.post(
  "/login",
  validateLogin,
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(login(req, res, next)).catch(next);
  },
);
router.post("/logout", logout);
router.post("/save-server-config", saveServerConfig);

export default router;
