"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";

interface MailServerConfig {
  imap: {
    host: string;
    port: number;
    tls: boolean;
  };
  smtp: {
    host: string;
    port: number;
    secure: boolean;
  };
}

interface MailConfigProps {
  onConfigured?: (config: MailServerConfig) => void;
}

const defaultConfigs = {
  gmail: {
    imap: { host: "imap.gmail.com", port: 993, tls: true },
    smtp: { host: "smtp.gmail.com", port: 587, secure: false },
  },
  outlook: {
    imap: { host: "outlook.office365.com", port: 993, tls: true },
    smtp: { host: "smtp-mail.outlook.com", port: 587, secure: false },
  },
  yahoo: {
    imap: { host: "imap.mail.yahoo.com", port: 993, tls: true },
    smtp: { host: "smtp.mail.yahoo.com", port: 587, secure: false },
  },
};

export default function MailConfig({ onConfigured }: MailConfigProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [config, setConfig] = useState<MailServerConfig>(defaultConfigs.gmail);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [customMode, setCustomMode] = useState(false);

  const handleProviderChange = (provider: keyof typeof defaultConfigs) => {
    setConfig(defaultConfigs[provider]);
    setTestResult(null);
  };

  const handleTestConnection = async () => {
    if (!email || !password) {
      setTestResult({
        success: false,
        message: "Veuillez remplir email et mot de passe",
      });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const response = await fetch("/api/mail/test-connection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          imapConfig: config.imap,
          smtpConfig: config.smtp,
        }),
      });

      const result = await response.json();
      setTestResult({
        success: result.success,
        message: result.message || "Test de connexion terminé",
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: "Erreur lors du test de connexion",
      });
    } finally {
      setTesting(false);
    }
  };

  const handleConnect = async () => {
    if (!email || !password) {
      setTestResult({
        success: false,
        message: "Veuillez remplir email et mot de passe",
      });
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:8080/api/v1/mail/connect",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-user-email": email,
          },
          body: JSON.stringify({
            email,
            password,
            imapConfig: config.imap,
            smtpConfig: config.smtp,
          }),
        },
      );

      const result = await response.json();
      if (result.success) {
        // Configurer le mailService avec les infos d'authentification
        const { mailService } = await import("../lib/services/mailService");
        mailService.setAuth(result.data.userId, email);

        // Stocker le userId pour les futures requêtes
        localStorage.setItem("mailUserId", result.data.userId);

        onConfigured?.(config);
        setTestResult({ success: true, message: "Connecté avec succès!" });
      } else {
        setTestResult({
          success: false,
          message: result.error || "Échec de connexion",
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: "Erreur lors de la connexion",
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configuration du Serveur Mail</CardTitle>
          <CardDescription>
            Configurez votre connexion aux serveurs IMAP/SMTP pour accéder à vos
            emails
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email et Mot de Passe */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Adresse Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
                }
                placeholder="votre@email.com"
              />
            </div>
            <div>
              <Label htmlFor="password">Mot de Passe</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPassword(e.target.value)
                }
                placeholder="Votre mot de passe"
              />
            </div>
          </div>

          {/* Sélection du Fournisseur */}
          <div className="space-y-3">
            <Label>Fournisseur d'Email</Label>
            <div className="flex gap-2">
              {Object.keys(defaultConfigs).map((provider) => (
                <Button
                  key={provider}
                  variant={
                    config ===
                    defaultConfigs[provider as keyof typeof defaultConfigs]
                      ? "default"
                      : "outline"
                  }
                  onClick={() =>
                    handleProviderChange(
                      provider as keyof typeof defaultConfigs,
                    )
                  }
                  className="capitalize"
                >
                  {provider}
                </Button>
              ))}
              <Button
                variant={customMode ? "default" : "outline"}
                onClick={() => setCustomMode(!customMode)}
              >
                Personnalisé
              </Button>
            </div>
          </div>

          {/* Configuration Personnalisée */}
          {customMode && (
            <div className="space-y-4 border rounded-lg p-4">
              <h3 className="font-medium">Configuration IMAP</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="imap-host">Serveur IMAP</Label>
                  <Input
                    id="imap-host"
                    value={config.imap.host}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setConfig((prev) => ({
                        ...prev,
                        imap: { ...prev.imap, host: e.target.value },
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="imap-port">Port IMAP</Label>
                  <Input
                    id="imap-port"
                    type="number"
                    value={config.imap.port}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setConfig((prev) => ({
                        ...prev,
                        imap: {
                          ...prev.imap,
                          port: parseInt(e.target.value) || 993,
                        },
                      }))
                    }
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="imap-tls"
                  checked={config.imap.tls}
                  onCheckedChange={(checked: boolean) =>
                    setConfig((prev) => ({
                      ...prev,
                      imap: { ...prev.imap, tls: checked },
                    }))
                  }
                />
                <Label htmlFor="imap-tls">Utiliser TLS/SSL</Label>
              </div>

              <h3 className="font-medium mt-4">Configuration SMTP</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="smtp-host">Serveur SMTP</Label>
                  <Input
                    id="smtp-host"
                    value={config.smtp.host}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setConfig((prev) => ({
                        ...prev,
                        smtp: { ...prev.smtp, host: e.target.value },
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="smtp-port">Port SMTP</Label>
                  <Input
                    id="smtp-port"
                    type="number"
                    value={config.smtp.port}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setConfig((prev) => ({
                        ...prev,
                        smtp: {
                          ...prev.smtp,
                          port: parseInt(e.target.value) || 587,
                        },
                      }))
                    }
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="smtp-secure"
                  checked={config.smtp.secure}
                  onCheckedChange={(checked: boolean) =>
                    setConfig((prev) => ({
                      ...prev,
                      smtp: { ...prev.smtp, secure: checked },
                    }))
                  }
                />
                <Label htmlFor="smtp-secure">
                  Connexion sécurisée (SSL/TLS)
                </Label>
              </div>
            </div>
          )}

          {/* Test et Connexion */}
          <div className="flex gap-3">
            <Button
              onClick={handleTestConnection}
              disabled={testing || !email || !password}
              variant="outline"
            >
              {testing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Test en cours...
                </>
              ) : (
                "Tester la connexion"
              )}
            </Button>
            <Button onClick={handleConnect} disabled={!email || !password}>
              Se connecter
            </Button>
          </div>

          {/* Résultat du Test */}
          {testResult && (
            <div
              className={`flex items-center gap-2 p-3 rounded-lg ${
                testResult.success
                  ? "bg-green-50 text-green-800"
                  : "bg-red-50 text-red-800"
              }`}
            >
              {testResult.success ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
