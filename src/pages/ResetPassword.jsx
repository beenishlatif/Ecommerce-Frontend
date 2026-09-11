import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { authApi } from '../api/endpoints.js';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await authApi.resetPassword({ token: searchParams.get('token'), password });
      setMessage('Password reset. You can now sign in.');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input type="password" required placeholder="New password" className="input-field" value={password} onChange={(e) => setPassword(e.target.value)} />
      {error && <p className="text-sm text-blush-600">{error}</p>}
      {message && <p className="text-sm text-charcoal-600">{message}</p>}
      <button type="submit" className="btn-primary w-full">Reset Password</button>
    </form>
  );
}
