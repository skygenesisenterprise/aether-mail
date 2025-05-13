import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/layout/Layout';
import EmailInbox from './components/email/EmailInbox';
import Login from './components/auth/login'; // Importer le composant Login
import Register from './components/auth/register'; // Importer le composant Register
import Recover from './components/auth/recover'; // Importer le composant Recover

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          {/* Routes publiques (sans Layout) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/recover" element={<Recover />} />

          {/* Routes protégées (avec Layout) */}
          <Route
            path="/*"
            element={
              <Layout>
                <Routes>
                  {/* Redirect root to inbox */}
                  <Route path="/" element={<Navigate to="/inbox" replace />} />

                  {/* Route dynamique pour les dossiers */}
                  <Route path="/:folder" element={<EmailInbox />} />

                  {/* Catch-all for not found routes */}
                  <Route path="*" element={<div className="flex h-full items-center justify-center p-8 text-gray-500 dark:text-gray-400">Page not found</div>} />
                </Routes>
              </Layout>
            }
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
