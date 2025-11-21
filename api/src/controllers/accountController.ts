import type { Request, Response } from "express";
import { UserService } from "../services/userService.js";

export class AccountController {
  static async register(req: Request, res: Response) {
    try {
      const { email, password, fullName, profile } = req.body;

      if (!email || !password || !fullName) {
        return res.status(400).json({
          success: false,
          error: "Email, password, and full name are required",
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          error: "Password must be at least 6 characters long",
        });
      }

      // Vérifier si l'utilisateur existe déjà
      const existingUser = await UserService.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: "User with this email already exists",
        });
      }

      // Créer le nouvel utilisateur
      const newUser = await UserService.create({
        email,
        password,
        fullName,
      });

      // Générer un token JWT simple (en production, utiliser une vraie librairie JWT)
      const token = Buffer.from(`${newUser.id}:${newUser.email}`).toString(
        "base64",
      );

      res.status(201).json({
        success: true,
        message: "Account created successfully",
        data: {
          account: {
            id: newUser.id,
            email: newUser.email,
            fullName: newUser.username,
            status: newUser.isActive ? "active" : "inactive",
            createdAt: newUser.createdAt,
          },
          tokens: {
            accessToken: token,
            refreshToken: token, // En production, utiliser un refresh token séparé
            idToken: token,
          },
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({
        success: false,
        error: "Registration failed",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: "Email and password are required",
        });
      }

      // Trouver l'utilisateur
      const user = await UserService.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: "Invalid credentials",
        });
      }

      // Vérifier le mot de passe
      const isValidPassword = await UserService.verifyPassword(
        password,
        user.password,
      );
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          error: "Invalid credentials",
        });
      }

      // Mettre à jour la date de dernière connexion
      await UserService.updateLastLogin(user.id);

      // Générer un token JWT simple
      const token = Buffer.from(`${user.id}:${user.email}`).toString("base64");

      res.json({
        success: true,
        message: "Login successful",
        data: {
          account: {
            id: user.id,
            email: user.email,
            fullName: user.username,
            status: user.isActive ? "active" : "inactive",
            lastLoginAt: new Date().toISOString(),
          },
          tokens: {
            accessToken: token,
            refreshToken: token,
            idToken: token,
          },
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        success: false,
        error: "Login failed",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  static async getProfile(req: Request, res: Response) {
    try {
      const userId = req.headers["x-user-id"] as string;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const user = await UserService.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          fullName: user.username,
          status: user.isActive ? "active" : "inactive",
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      console.error("Get profile error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to get profile",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}
