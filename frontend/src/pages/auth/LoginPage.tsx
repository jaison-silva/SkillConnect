import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useLoginMutation } from '../../store/api/authApi';
import { setCredentials } from '../../store/slices/authSlice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import PasswordInput from '../../components/PasswordInput';
import GoogleAuthButton from '../../components/GoogleAuthButton';
import { validateEmail, validatePassword } from '../../utils/validation';

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user: currentUser } = useAppSelector((state) => state.auth);
  const [login, { isLoading }] = useLoginMutation();

  useEffect(() => {
    if (isAuthenticated) {
      navigate(currentUser?.role === 'ADMIN' ? '/admin/users' : '/', { replace: true });
    }
  }, [isAuthenticated, currentUser, navigate]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  const emailError = touched.email ? validateEmail(email) : null;
  const passwordError = touched.password ? validatePassword(password) : null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setTouched({ email: true, password: true });

    const eErr = validateEmail(email);
    const pErr = validatePassword(password);

    if (eErr || pErr) {
      toast.error(eErr || pErr || 'Please check the form for errors');
      return;
    }

    try {
      const res = await login({
        email: email.trim().toLowerCase(),
        password,
      }).unwrap();
      const { user, accessToken } = res.data;
      dispatch(setCredentials({ user, accessToken }));
      toast.success(`Welcome back, ${user.name}!`);
      navigate(user.role === 'ADMIN' ? '/admin/users' : '/', { replace: true });
    } catch (err: unknown) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ||
        'Login failed';
      toast.error(message);
    }
  };

  return (
    <div className="centered">
      <form className="form-card" onSubmit={handleSubmit} noValidate>
        <h2>Sign In</h2>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
            placeholder="you@example.com"
            autoComplete="email"
            className={emailError ? 'input-error' : ''}
            aria-invalid={Boolean(emailError)}
            aria-describedby={emailError ? 'email-error' : undefined}
            required
          />
          {emailError && (
            <span id="email-error" className="error-text">
              {emailError}
            </span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <PasswordInput
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
            placeholder="••••••"
            autoComplete="current-password"
            isInvalid={Boolean(passwordError)}
            ariaDescribedBy={passwordError ? 'password-error' : undefined}
            required
          />
          {passwordError && (
            <span id="password-error" className="error-text">
              {passwordError}
            </span>
          )}
        </div>

        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? 'Signing in…' : 'Sign In'}
        </button>

        <GoogleAuthButton mode="login" />

        <div className="form-links">
          <p>
            Don't have an account? <Link to="/register">Register</Link>
          </p>
          <p>
            <Link to="/forgot-password">Forgot password?</Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
