import { useState } from 'react';
import { authApi } from '../api/endpoints.js';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await authApi.forgotPassword({ email });
      setSent(true);
    } catch (err) {
      setError(err.message);
    }
  };

  if (sent) return <p className="text-sm text-charcoal-600">If that email is registered, a reset link has been sent.</p>;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input type="email" required placeholder="Your email" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} />
      {error && <p className="text-sm text-blush-600">{error}</p>}
      <button type="submit" className="btn-primary w-full">Send Reset Link</button>
    </form>
  );
}
