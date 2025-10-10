import passport from "../passport";
import { Request, Response, NextFunction } from "express";

export const jwtAuth = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate("jwt", { session: false }, (err: any, user: any) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    req.user = user;
    next();
  })(req, res, next);
};
