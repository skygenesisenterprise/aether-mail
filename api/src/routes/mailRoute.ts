import { Router } from "express";
import { MailController } from "../controllers/mailController";

const router: Router = Router();

// Test mail server connection
router.post("/test-connection", MailController.testConnection);

// Connect to mail servers
router.post("/connect", MailController.connect);

// Disconnect from mail servers
router.post("/disconnect", MailController.disconnect);

// Get IMAP folders
router.get("/folders", MailController.getFolders);

// Get emails from folder
router.get("/emails", MailController.getEmails);

// Send email
router.post("/send", MailController.sendEmail);

// Move email to folder
router.post("/move", MailController.moveEmail);

// Copy email to folder
router.post("/copy", MailController.copyEmail);

// Delete email
router.post("/delete", MailController.deleteEmail);

// Mark email as read
router.post("/mark-read", MailController.markEmailAsRead);

// Mark email as unread
router.post("/mark-unread", MailController.markEmailAsUnread);

// Toggle email star
router.post("/toggle-star", MailController.toggleEmailStar);

export default router;
