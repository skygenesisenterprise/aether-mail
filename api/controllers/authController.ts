import type { Request, Response, NextFunction } from "express";
import { createMailAccount, validateMailLogin } from "../services/authService";
import { loginWithExternalAuth } from "../services/authService";
import Joi from "joi";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import passport from "../passport";
import dotenv from "dotenv";

dotenv.config();

const registerSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

export async function register(req: Request, res: Response) {
  const { error } = registerSchema.validate(req.body);
  if (error) {
    res.status(400).json({ success: false, error: error.details[0].message });
    return;
  }

  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await createMailAccount({
    username,
    email: `${username}@${process.env.MAIL_DOMAIN}`,
    password: hashedPassword,
  });
  if (result.success) {
    res.json({ success: true });
  } else {
    res.status(400).json({ success: false, error: result.error });
  }
}

export const login = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate(
    "local",
    { session: false },
    (err: any, user: any, info: any) => {
      if (err) {
        return next(err);
      }

      if (!user) {
        return res
          .status(401)
          .json({
            success: false,
            error: info.message || "Invalid credentials",
          });
      }

      // Générer un JWT
      const token = jwt.sign(
        { username: user.username, id: user.id },
        process.env.JWT_SECRET || "dev-secret-key-change-in-production",
        { expiresIn: "1h" },
      );

      return res.json({ success: true, token, user });
    },
  )(req, res, next);
};

export const logout = async (req: Request, res: Response) => {
  res.json({ success: true });
};
