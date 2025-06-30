import { useState } from "react";

export default function GenericSSOLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/v1/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Erreur lors de la connexion");
      } else {
        // Connexion réussie, gérer la redirection ou stockage token ici
        alert("Connexion réussie !");
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
          <h1 className="mt-4 text-3xl font-semibold text-gray-900">Sky Genesis Enterprise</h1>
          <p className="mt-1 text-sm text-gray-500">Connectez-vous pour continuer</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Adresse e-mail
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              placeholder="exemple@domaine.com"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
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
              loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
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