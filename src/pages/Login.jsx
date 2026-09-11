import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const ACCENT = '#A88950';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Enter a valid email address';
    if (!form.password) errs.password = 'Enter your password';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;

    setLoading(true);
    try {
      await login({ ...form, rememberMe });
      navigate(searchParams.get('redirect') || '/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <Field
        icon={Mail}
        type="email"
        placeholder="Email address"
        value={form.email}
        onChange={(v) => setForm({ ...form, email: v })}
        error={fieldErrors.email}
        autoComplete="email"
      />

      <Field
        icon={Lock}
        type={showPassword ? 'text' : 'password'}
        placeholder="Password"
        value={form.password}
        onChange={(v) => setForm({ ...form, password: v })}
        error={fieldErrors.password}
        autoComplete="current-password"
        endAdornment={
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((s) => !s)}
            className="text-charcoal-300 hover:text-charcoal-500"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        }
      />

      <div className="flex items-center justify-between text-xs">
        <label className="flex items-center gap-2 text-charcoal-500 cursor-pointer">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            style={{ accentColor: ACCENT }}
          />
          Remember me
        </label>
        <Link to="/forgot-password" className="font-medium hover:underline" style={{ color: ACCENT }}>
          Forgot password?
        </Link>
      </div>

      {error && <p className="text-sm text-blush-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 text-sm font-medium py-3 rounded-lg text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        style={{ backgroundColor: ACCENT }}
      >
        {loading ? (
          'Signing in…'
        ) : (
          <>
            <LogIn className="h-4 w-4" /> Sign In
          </>
        )}
      </button>

      <p className="text-xs text-charcoal-400 pt-1 text-center">
        Don't have an account?{' '}
        <Link to="/register" className="font-medium" style={{ color: ACCENT }}>
          Create one
        </Link>
      </p>
    </form>
  );
}

function Field({ icon: Icon, type, placeholder, value, onChange, error, autoComplete, endAdornment }) {
  return (
    <div>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-300" />
        <input
          required
          type={type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="input-field w-full pl-10"
          style={endAdornment ? { paddingRight: '2.5rem' } : undefined}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {endAdornment && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2">{endAdornment}</span>
        )}
      </div>
      {error && <p className="text-xs text-blush-600 mt-1">{error}</p>}
    </div>
  );
}