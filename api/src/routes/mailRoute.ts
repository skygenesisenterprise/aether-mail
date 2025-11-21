import { Router } from "express";
import { MailController } from "../controllers/mailController.js";

const router: Router = Router();

// Configure mail server
router.post("/config", MailController.configureMail);

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
router.patch("/emails/:uid/move", MailController.moveEmail);

// Copy email to folder
router.post("/emails/:uid/copy", MailController.copyEmail);

// Delete email
router.delete("/emails/:uid", MailController.deleteEmail);

// Mark email as read
router.patch("/emails/:uid/read", MailController.markEmailAsRead);

// Mark email as unread
router.patch("/emails/:uid/unread", MailController.markEmailAsUnread);

// Toggle email star
router.patch("/emails/:uid/star", MailController.toggleEmailStar);

export default router;
