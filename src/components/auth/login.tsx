import React, { useState } from 'react';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      setError('Please fill in all fields.');
      setSuccess('');
      return;
    }

    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setSuccess('Login successful!');
        // Ici tu peux rediriger ou stocker le token si besoin
      } else {
        setError(data.error || 'Invalid credentials.');
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
        <h1 className="text-3xl font-bold text-center mb-6">Login</h1>
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-4 text-sm text-red-400 text-center">{error}</div>
          )}
          {success && (
            <div className="mb-4 text-sm text-green-400 text-center">{success}</div>
          )}
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium mb-1">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-md border border-white/30 bg-transparent px-4 py-2 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white"
              placeholder="Your username"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-white/30 bg-transparent px-4 py-2 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white"
              placeholder="••••••••"
              required
            />
          </div>
          <div className="flex items-center justify-between text-sm mb-6">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="accent-white" />
              Remember me
            </label>
            <a href="/recover" className="text-white hover:underline">
              Forgot password?
            </a>
          </div>
          <button
            type="submit"
            className="w-full bg-white text-gray-900 font-semibold py-2 rounded-md hover:bg-gray-200 transition"
          >
            Login
          </button>
        </form>
        <div className="mt-6 text-sm text-center text-white/80">
          Don't have an account?{' '}
          <a href="/register" className="font-semibold text-white hover:underline">
            Register here!
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;