import React, { useState } from 'react';

const Recover: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation simple
    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    // Simuler une requête de récupération de mot de passe
    console.log('Recovering password for:', email);
    setError(''); // Réinitialiser les erreurs
    setSuccess(true); // Simuler un succès
  };

  return (
    <div className="flex h-full items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-white">Recover Password</h1>
        {success ? (
          <div className="mt-6 text-center text-sm text-green-500">
            A password recovery link has been sent to your email address.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6">
            {error && <div className="mb-4 text-sm text-red-500">{error}</div>}
            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-aether-primary focus:ring-aether-primary dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                placeholder="you@example.com"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-md bg-aether-primary px-4 py-2 text-white hover:bg-aether-accent focus:outline-none focus:ring-2 focus:ring-aether-primary focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            >
              Send Recovery Link
            </button>
          </form>
        )}
        <div className="mt-4 text-sm text-center text-gray-600 dark:text-gray-400">
          Remember your password?{' '}
          <a href="/login" className="text-aether-primary hover:underline">
            Login here
          </a>
        </div>
      </div>
    </div>
  );
};

export default Recover;