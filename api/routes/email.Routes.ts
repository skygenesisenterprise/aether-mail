// api/routes/email.Routes.ts
import { Router } from "express";
import {
  getEmails,
  sendEmail,
  markAsRead,
  toggleStar,
  deleteEmail,
  searchEmails,
  getEmailStats,
  downloadAttachment,
} from "../controllers/emailController";
import { jwtAuth } from "../middlewares/jwtAuth";

const router = Router();

// Routes principales pour les emails
router.get("/emails", jwtAuth, getEmails);
router.post("/emails", jwtAuth, sendEmail);

// Routes pour les actions sur les emails individuels
router.patch("/emails/:emailId/read", jwtAuth, markAsRead);
router.patch("/emails/:emailId/star", jwtAuth, toggleStar);
router.delete("/emails/:emailId", jwtAuth, deleteEmail);

// Routes de recherche et statistiques
router.get("/emails/search", jwtAuth, searchEmails);
router.get("/emails/stats", jwtAuth, getEmailStats);

// Route pour télécharger les pièces jointes
router.get(
  "/emails/:emailId/attachments/:attachmentId",
  jwtAuth,
  downloadAttachment,
);

export default router;
