import type React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { useAuthStore } from "./store/authStore";
import EmailLayout from "./components/layout/EmailLayout";
import EmailInbox from "./components/email/EmailInbox";
import Login from "./components/auth/login"; // Importer le composant Login
import Register from "./components/auth/register"; // Importer le composant Register
import Recover from "./components/auth/recover"; // Importer le composant Recover
import ServerConfig from "./components/auth/serverConfig"; // Importer le composant ServerConfig

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const isDev = process.env.NODE_ENV !== "production";

  return (
    <Router>
      <Routes>
        {/* Routes publiques (sans Layout) */}
        <Route path="/config-servers" element={<ServerConfig />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/recover" element={<Recover />} />

        {/* Routes protégées (avec EmailLayout) */}
        {isAuthenticated || isDev ? (
          <Route
            path="/*"
            element={
              <EmailLayout>
                <Routes>
                  {/* Redirect root to inbox */}
                  <Route path="/" element={<Navigate to="/inbox" replace />} />

                  {/* Route dynamique pour les dossiers */}
                  <Route path="/:folder" element={<EmailInbox />} />

                  {/* Catch-all for not found routes */}
                  <Route
                    path="*"
                    element={
                      <div className="flex h-full items-center justify-center p-8 text-gray-500 dark:text-gray-400">
                        Page not found
                      </div>
                    }
                  />
                </Routes>
              </EmailLayout>
            }
          />
        ) : (
          <Route path="/*" element={<Navigate to="/login" replace />} />
        )}
      </Routes>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;
