import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface ServerConfig {
  imapHost: string;
  imapPort: number;
  imapTls: boolean;
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
}

export default function ServerConfig() {
  const navigate = useNavigate();
  const [config, setConfig] = useState<ServerConfig>(() => {
    const saved = localStorage.getItem("serverConfig");
    return saved
      ? JSON.parse(saved)
      : {
          imapHost: "",
          imapPort: 993,
          imapTls: true,
          smtpHost: "",
          smtpPort: 465,
          smtpSecure: true,
        };
  });

  const loadPreset = (preset: string) => {
    if (preset === "gmail") {
      setConfig({
        imapHost: "imap.gmail.com",
        imapPort: 993,
        imapTls: true,
        smtpHost: "smtp.gmail.com",
        smtpPort: 465,
        smtpSecure: true,
      });
    } else if (preset === "outlook") {
      setConfig({
        imapHost: "outlook.office365.com",
        imapPort: 993,
        imapTls: true,
        smtpHost: "smtp-mail.outlook.com",
        smtpPort: 587,
        smtpSecure: false,
      });
    } else if (preset === "o2switch") {
      setConfig({
        imapHost: "mail.o2switch.net",
        imapPort: 993,
        imapTls: true,
        smtpHost: "mail.o2switch.net",
        smtpPort: 465,
        smtpSecure: true,
      });
    }
  };
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (
    field: keyof ServerConfig,
    value: string | number | boolean,
  ) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Sauvegarder dans localStorage pour le test
      localStorage.setItem("serverConfig", JSON.stringify(config));
      navigate("/login");
    } catch (err) {
      setError("Erreur lors de la sauvegarde");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-blue-50 to-white px-6">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-lg p-10 border border-gray-200">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-blue-600 rounded-md flex items-center justify-center text-white font-bold text-2xl select-none">
            SG
          </div>
          <h1 className="mt-4 text-3xl font-semibold text-gray-900">
            Configuration des serveurs
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Configurez vos serveurs SMTP et IMAP
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Vous saisirez vos identifiants lors de la connexion
          </p>
          <div className="mt-4 flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => loadPreset("gmail")}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
            >
              Gmail
            </button>
            <button
              type="button"
              onClick={() => loadPreset("outlook")}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              Outlook
            </button>
            <button
              type="button"
              onClick={() => loadPreset("o2switch")}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
            >
              O2Switch
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* IMAP Config */}
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-gray-900">
                Serveur IMAP
              </h2>
              <div>
                <label
                  htmlFor="imapHost"
                  className="block text-sm font-medium text-gray-700"
                >
                  Hôte IMAP
                </label>
                <input
                  id="imapHost"
                  type="text"
                  required
                  value={config.imapHost}
                  onChange={(e) => handleChange("imapHost", e.target.value)}
                  className="mt-1 w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  placeholder="imap.example.com"
                  disabled={loading}
                />
              </div>
              <div>
                <label
                  htmlFor="imapPort"
                  className="block text-sm font-medium text-gray-700"
                >
                  Port IMAP
                </label>
                <input
                  id="imapPort"
                  type="number"
                  required
                  value={config.imapPort}
                  onChange={(e) =>
                    handleChange("imapPort", parseInt(e.target.value, 10))
                  }
                  className="mt-1 w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  disabled={loading}
                />
              </div>
              <div className="flex items-center">
                <input
                  id="imapTls"
                  type="checkbox"
                  checked={config.imapTls}
                  onChange={(e) => handleChange("imapTls", e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={loading}
                />
                <label
                  htmlFor="imapTls"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Utiliser TLS
                </label>
              </div>
            </div>

            {/* SMTP Config */}
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-gray-900">
                Serveur SMTP
              </h2>
              <div>
                <label
                  htmlFor="smtpHost"
                  className="block text-sm font-medium text-gray-700"
                >
                  Hôte SMTP
                </label>
                <input
                  id="smtpHost"
                  type="text"
                  required
                  value={config.smtpHost}
                  onChange={(e) => handleChange("smtpHost", e.target.value)}
                  className="mt-1 w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  placeholder="smtp.example.com"
                  disabled={loading}
                />
              </div>
              <div>
                <label
                  htmlFor="smtpPort"
                  className="block text-sm font-medium text-gray-700"
                >
                  Port SMTP
                </label>
                <input
                  id="smtpPort"
                  type="number"
                  required
                  value={config.smtpPort}
                  onChange={(e) =>
                    handleChange("smtpPort", parseInt(e.target.value, 10))
                  }
                  className="mt-1 w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  disabled={loading}
                />
              </div>
              <div className="flex items-center">
                <input
                  id="smtpSecure"
                  type="checkbox"
                  checked={config.smtpSecure}
                  onChange={(e) => handleChange("smtpSecure", e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={loading}
                />
                <label
                  htmlFor="smtpSecure"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Utiliser SSL/TLS
                </label>
              </div>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 text-center" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 mt-2 rounded-lg font-semibold text-lg text-white transition-colors ${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Sauvegarde..." : "Continuer vers la connexion"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          <button
            onClick={() => navigate("/login")}
            className="hover:underline text-blue-600"
          >
            Aller à la connexion
          </button>
        </div>
      </div>
    </div>
  );
}
