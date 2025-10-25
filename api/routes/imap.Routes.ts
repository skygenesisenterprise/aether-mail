import { Router, Request, Response } from "express";
import { fetchInboxMails } from "../services/mailService";
import config from "../utils/config";

// Cette route suppose que l'utilisateur est authentifié et que ses identifiants IMAP sont disponibles dans req.body ou req.user
const router = Router();

router.post("/inbox", async (req: Request, res: Response) => {
  const { imapConfig } = req.body;
  if (
    !imapConfig ||
    !imapConfig.imapUser ||
    !imapConfig.imapPass ||
    !imapConfig.imapHost
  ) {
    return res
      .status(400)
      .json({ success: false, error: "Missing IMAP config." });
  }

  try {
    const mails = await fetchInboxMails({
      username: imapConfig.imapUser,
      password: imapConfig.imapPass,
      host: imapConfig.imapHost,
      port: imapConfig.imapPort,
      tls: imapConfig.imapTls,
    });
    res.json({ success: true, mails });
  } catch (err: any) {
    res
      .status(500)
      .json({ success: false, error: err.message || "Unable to fetch inbox." });
  }
});

export default router;
