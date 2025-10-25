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
        return res.status(401).json({
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

export const saveServerConfig = async (req: Request, res: Response) => {
  // TODO: Implement saving server config to database
  // For now, just return success
  res.json({ success: true, message: "Configuration sauvegardée" });
};

export const testImapLogin = async (req: Request, res: Response) => {
  const { email, password, serverConfig } = req.body;
  if (!email || !password || !serverConfig) {
    return res
      .status(400)
      .json({ success: false, error: "Missing credentials or config" });
  }

  try {
    // Test IMAP connection
    const Imap = (await import("imap")).default;
    const imap = new Imap({
      user: email,
      password,
      host: serverConfig.imapHost,
      port: serverConfig.imapPort,
      tls: serverConfig.imapTls,
    });

    return new Promise((resolve) => {
      imap.once("ready", () => {
        imap.end();
        resolve(res.json({ success: true, message: "Login successful" }));
      });
      imap.once("error", (err: any) => {
        resolve(
          res
            .status(401)
            .json({
              success: false,
              error: err.message || "IMAP login failed",
            }),
        );
      });
      imap.connect();
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};
