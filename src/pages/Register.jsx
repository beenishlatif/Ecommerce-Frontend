import { useState, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const ACCENT = '#A88950';

function getPasswordStrength(password) {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return Math.min(score, 4); // 0–4
}

const STRENGTH_LABELS = ['Weak', 'Fair', 'Good', 'Strong', 'Excellent'];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [subscribeNews, setSubscribeNews] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const strength = useMemo(() => getPasswordStrength(form.password), [form.password]);

  const validate = () => {
    const errs = {};
    if (form.name.trim().length < 2) errs.name = 'Enter your full name';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Enter a valid email address';
    if (form.password.length < 8) errs.password = 'Password must be at least 8 characters';
    if (form.confirmPassword !== form.password) errs.confirmPassword = 'Passwords do not match';
    if (!agreeTerms) errs.terms = 'You must agree to the Terms to continue';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;

    setLoading(true);
    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        subscribeNews,
      });
      navigate(searchParams.get('redirect') || '/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const strengthColor = ['#D4483F', '#D97706', '#CA9A2A', ACCENT, '#3F7D4F'][strength];

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <Field
        icon={User}
        type="text"
        placeholder="Full name"
        value={form.name}
        onChange={(v) => setForm({ ...form, name: v })}
        error={fieldErrors.name}
        autoComplete="name"
      />

      <Field
        icon={Mail}
        type="email"
        placeholder="Email address"
        value={form.email}
        onChange={(v) => setForm({ ...form, email: v })}
        error={fieldErrors.email}
        autoComplete="email"
      />

      <div>
        <Field
          icon={Lock}
          type={showPassword ? 'text' : 'password'}
          placeholder="Password"
          value={form.password}
          onChange={(v) => setForm({ ...form, password: v })}
          error={fieldErrors.password}
          autoComplete="new-password"
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
        {form.password && (
          <div className="mt-2">
            <div className="flex gap-1">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className="h-1 flex-1 rounded-full transition-colors"
                  style={{ backgroundColor: i <= strength ? strengthColor : 'rgba(38,38,38,0.1)' }}
                />
              ))}
            </div>
            <p className="text-[11px] mt-1" style={{ color: strengthColor }}>
              {STRENGTH_LABELS[strength]}
            </p>
          </div>
        )}
      </div>

      <Field
        icon={Lock}
        type={showConfirm ? 'text' : 'password'}
        placeholder="Confirm password"
        value={form.confirmPassword}
        onChange={(v) => setForm({ ...form, confirmPassword: v })}
        error={fieldErrors.confirmPassword}
        autoComplete="new-password"
        endAdornment={
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowConfirm((s) => !s)}
            className="text-charcoal-300 hover:text-charcoal-500"
          >
            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        }
      />

      <div className="space-y-2">
        <label className="flex items-start gap-2.5 text-xs text-charcoal-500 cursor-pointer">
          <input
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            className="mt-0.5"
            style={{ accentColor: ACCENT }}
          />
          <span>
            I agree to the{' '}
            <Link to="/terms" target="_blank" className="underline" style={{ color: ACCENT }}>
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy-policy" target="_blank" className="underline" style={{ color: ACCENT }}>
              Privacy Policy
            </Link>
          </span>
        </label>
        {fieldErrors.terms && <p className="text-xs text-blush-600 ml-6">{fieldErrors.terms}</p>}

        <label className="flex items-start gap-2.5 text-xs text-charcoal-500 cursor-pointer">
          <input
            type="checkbox"
            checked={subscribeNews}
            onChange={(e) => setSubscribeNews(e.target.checked)}
            className="mt-0.5"
            style={{ accentColor: ACCENT }}
          />
          <span>Send me offers, new arrivals, and updates by email</span>
        </label>
      </div>

      {error && <p className="text-sm text-blush-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 text-sm font-medium py-3 rounded-lg text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        style={{ backgroundColor: ACCENT }}
      >
        {loading ? (
          'Creating account…'
        ) : (
          <>
            <Check className="h-4 w-4" /> Create Account
          </>
        )}
      </button>

      <p className="text-xs text-charcoal-400 pt-1 text-center">
        Already have an account?{' '}
        <Link to="/login" className="font-medium" style={{ color: ACCENT }}>
          Sign in
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