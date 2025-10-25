import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

export default function GenericSSOLogin() {
  const navigate = useNavigate();
  const { login, checkSession, isAuthenticated, isLoading } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Vérifier la session au montage du composant
    checkSession();

    // Vérifier si les serveurs sont configurés
    const serverConfig = localStorage.getItem("serverConfig");
    if (!serverConfig) {
      navigate("/config-servers");
    }
  }, [checkSession, navigate]);

  useEffect(() => {
    // Rediriger si déjà authentifié
    if (isAuthenticated && !isLoading) {
      navigate("/inbox");
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Récupérer les configs serveur du localStorage
      const serverConfig = localStorage.getItem("serverConfig");
      const servers = serverConfig ? JSON.parse(serverConfig) : null;

      // Combiner avec les identifiants
      const fullConfig = servers
        ? {
            ...servers,
            imapUser: email,
            imapPass: password,
            smtpUser: email,
            smtpPass: password,
          }
        : null;

      const result = await login(email, password, fullConfig);

      if (result.success) {
        // Sauvegarder les identifiants pour les futures requêtes
        localStorage.setItem(
          "userCredentials",
          JSON.stringify({ email, password }),
        );
        navigate("/inbox");
      } else {
        setError(result.error || "Erreur lors de la connexion");
      }
    } catch (err) {
      setError("Erreur réseau, veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-blue-50 to-white px-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-10 border border-gray-200">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-blue-600 rounded-md flex items-center justify-center text-white font-bold text-2xl select-none">
            SG
          </div>
          <h1 className="mt-4 text-3xl font-semibold text-gray-900">
            Sky Genesis Enterprise
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Connectez-vous pour continuer
          </p>
          <p className="mt-2 text-xs text-gray-400">Dev: admin / admin</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              placeholder="admin@example.com"
              disabled={loading}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              placeholder="••••••••"
              disabled={loading}
            />
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
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          <a href="#" className="hover:underline text-blue-600">
            Mot de passe oublié ?
          </a>
        </div>
      </div>
    </div>
  );
}
