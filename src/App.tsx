import type React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/layout/Layout';
import EmailInbox from './components/email/EmailInbox';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <Router>
        <Layout>
          <Routes>
            {/* Redirect root to inbox */}
            <Route path="/" element={<Navigate to="/inbox" replace />} />

            {/* Email routes */}
            <Route path="/inbox" element={<EmailInbox />} />

            {/* Other potential routes that would be implemented in a full app */}
            <Route path="/sent" element={<div className="flex h-full items-center justify-center p-8 text-gray-500 dark:text-gray-400">Sent emails would be shown here</div>} />
            <Route path="/drafts" element={<div className="flex h-full items-center justify-center p-8 text-gray-500 dark:text-gray-400">Draft emails would be shown here</div>} />
            <Route path="/trash" element={<div className="flex h-full items-center justify-center p-8 text-gray-500 dark:text-gray-400">Deleted emails would be shown here</div>} />
            <Route path="/settings" element={<div className="flex h-full items-center justify-center p-8 text-gray-500 dark:text-gray-400">Settings would be shown here</div>} />
            <Route path="/profile" element={<div className="flex h-full items-center justify-center p-8 text-gray-500 dark:text-gray-400">User profile would be shown here</div>} />
            <Route path="/encrypted" element={<div className="flex h-full items-center justify-center p-8 text-gray-500 dark:text-gray-400">Encrypted emails would be shown here</div>} />
            <Route path="/protected" element={<div className="flex h-full items-center justify-center p-8 text-gray-500 dark:text-gray-400">Protected emails would be shown here</div>} />

            {/* Catch-all for not found routes */}
            <Route path="*" element={<div className="flex h-full items-center justify-center p-8 text-gray-500 dark:text-gray-400">Page not found</div>} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
};

export default App;
