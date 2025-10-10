import type React from 'react';
import { useState } from 'react';

const Recover: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!identifier) {
      setError('Please enter your username or email.');
      setSuccess('');
      return;
    }

    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/v1/recover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setSuccess('Recovery instructions have been sent if the account exists.');
      } else {
        setError(data.error || 'Unable to process your request.');
      }
    } catch (err) {
      setError('Error connecting to server.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center" style={{
      backgroundImage: "url('https://c.wallhere.com/photos/da/70/digital_art_landscape_illustration_skyline-2285476.jpg!d')"
    }}>
      <div className="relative w-full max-w-md p-8 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-md text-white">
        <div className="absolute bottom-2 right-4 text-xs text-white/80 font-sans">
          Powered by Sky Genesis Enterprise
        </div>
        <h1 className="text-3xl font-bold text-center mb-6">Recover Password</h1>
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-4 text-sm text-red-400 text-center">{error}</div>
          )}
          {success && (
            <div className="mb-4 text-sm text-green-400 text-center">{success}</div>
          )}
          <div className="mb-6">
            <label htmlFor="identifier" className="block text-sm font-medium mb-1">
              Username or Email
            </label>
            <input
              type="text"
              id="identifier"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full rounded-md border border-white/30 bg-transparent px-4 py-2 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white"
              placeholder="Enter your username or email"
              required
              autoComplete="username"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-white text-gray-900 font-semibold py-2 rounded-md hover:bg-gray-200 transition"
          >
            Send recovery email
          </button>
        </form>
        <div className="mt-6 text-sm text-center text-white/80">
          Remembered your password?{' '}
          <a href="/login" className="font-semibold text-white hover:underline">
            Login here!
          </a>
        </div>
      </div>
    </div>
  );
};

export default Recover;