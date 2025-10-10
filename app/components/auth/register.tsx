import type React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DOMAIN = '@aethermail.me';

const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  const email = username ? `${username}${DOMAIN}` : '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      setSuccess('');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setSuccess('');
      return;
    }

    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/v1/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setSuccess('Account created! You can now log in.');
        setTimeout(() => navigate('/login'), 1500); // Redirige après 1,5s
      } else {
        setError(data.error || 'Failed to create account.');
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
        <h1 className="text-3xl font-bold text-center mb-6">Register</h1>
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
              onChange={(e) => setUsername(e.target.value.replace(/\s/g, '').toLowerCase())}
              className="w-full rounded-md border border-white/30 bg-transparent px-4 py-2 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white"
              placeholder="user.name"
              required
              autoComplete="username"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email (suggested)
            </label>
            <input
              type="text"
              id="email"
              value={email}
              className="w-full rounded-md border border-white/30 bg-gray-700/30 px-4 py-2 text-white placeholder-white/70 focus:outline-none"
              placeholder={`user.name${DOMAIN}`}
              disabled
              readOnly
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-white/30 bg-transparent px-4 py-2 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white pr-10"
                placeholder="••••••••"
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-white/70 text-xs"
                tabIndex={-1}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-md border border-white/30 bg-transparent px-4 py-2 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white pr-10"
                placeholder="••••••••"
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-white/70 text-xs"
                tabIndex={-1}
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-white text-gray-900 font-semibold py-2 rounded-md hover:bg-gray-200 transition"
          >
            Register
          </button>
        </form>
        <div className="mt-6 text-sm text-center text-white/80">
          Already have an account?{' '}
          <a href="/login" className="font-semibold text-white hover:underline">
            Login here!
          </a>
        </div>
      </div>
    </div>
  );
};

export default Register;