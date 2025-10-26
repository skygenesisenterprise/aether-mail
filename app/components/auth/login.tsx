// AuthPage.tsx
import type React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Simule une connexion locale pour dev
    if (email === "user@sge.local" && password === "password") {
      setError("");
      // Redirige vers /dashboard après connexion
      navigate("/inbox");
    } else {
      setError("Email ou mot de passe invalide.");
    }
  };

  const handleSSOLogin = () => {
    // Redirection vers Keycloak SSO
    window.location.href =
      "https://sso.skygenesisenterprise.com/auth/realms/sge-realm/protocol/openid-connect/auth?client_id=my-enterprise-app&redirect_uri=http://localhost:3000/auth/callback&response_type=code&scope=openid profile email";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Sky Genesis Enterprise
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Connectez-vous à votre compte Entreprise
          </p>
        </div>

        {error && <div className="text-red-500 text-sm text-center">{error}</div>}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Email"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Mot de passe"
              />
            </div>
          </div>

          <button
            type="submit"
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Se connecter
          </button>
        </form>

        <div className="mt-6">
          <button
            onClick={handleSSOLogin}
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            Se connecter avec SSO
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Sky Genesis Enterprise. Tous droits
          réservés.
        </p>
      </div>
    </div>
  );
};

export default AuthPage;