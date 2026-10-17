import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useRegisterMutation } from '../../store/api/authApi';
import { UserRole } from '../../types';
import PasswordInput from '../../components/PasswordInput';
import {
  validateName,
  validateEmail,
  validatePassword,
  validateConfirmPassword,
} from '../../utils/validation';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [register, { isLoading }] = useRegisterMutation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.CLIENT);

  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const nameError = touched.name ? validateName(name) : null;
  const emailError = touched.email ? validateEmail(email) : null;
  const passwordError = touched.password ? validatePassword(password) : null;
  const confirmPasswordError = touched.confirmPassword
    ? validateConfirmPassword(password, confirmPassword)
    : null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    const nErr = validateName(name);
    const eErr = validateEmail(email);
    const pErr = validatePassword(password);
    const cpErr = validateConfirmPassword(password, confirmPassword);

    if (nErr || eErr || pErr || cpErr) {
      toast.error(nErr || eErr || pErr || cpErr || 'Please resolve form errors');
      return;
    }

    try {
      // confirmPassword is only checked on frontend and NOT sent to backend
      const res = await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
      }).unwrap();

      if (res.data.debugOtp) {
        toast.success(`OTP (dev): ${res.data.debugOtp}`, { duration: 10000 });
      } else {
        toast.success('Registration successful. Please check your email for OTP.');
      }
      navigate('/verify-otp', { state: { email: email.trim().toLowerCase() } });
    } catch (err: unknown) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ||
        'Registration failed';
      toast.error(message);
    }
  };

  return (
    <div className="centered">
      <form className="form-card" onSubmit={handleSubmit} noValidate>
        <h2>Create Account</h2>

        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
            placeholder="John Doe"
            autoComplete="name"
            className={nameError ? 'input-error' : ''}
            aria-invalid={Boolean(nameError)}
            aria-describedby={nameError ? 'name-error' : undefined}
            required
          />
          {nameError && (
            <span id="name-error" className="error-text">
              {nameError}
            </span>
          )}
        </div>

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
            placeholder="Min 6 characters"
            autoComplete="new-password"
            minLength={6}
            isInvalid={Boolean(passwordError)}
            ariaDescribedBy={passwordError ? 'password-error' : undefined}
            required
          />
          {passwordError ? (
            <span id="password-error" className="error-text">
              {passwordError}
            </span>
          ) : (
            <span className="hint-text">Must be at least 6 characters</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <PasswordInput
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onBlur={() =>
              setTouched((prev) => ({ ...prev, confirmPassword: true }))
            }
            placeholder="Re-enter password"
            autoComplete="new-password"
            isInvalid={Boolean(confirmPasswordError)}
            ariaDescribedBy={
              confirmPasswordError ? 'confirm-password-error' : undefined
            }
            required
          />
          {confirmPasswordError && (
            <span id="confirm-password-error" className="error-text">
              {confirmPasswordError}
            </span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="role">I am a</label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
          >
            <option value={UserRole.CLIENT}>Client</option>
            <option value={UserRole.PROVIDER}>Service Provider</option>
          </select>
        </div>

        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? 'Creating account…' : 'Register'}
        </button>

        <div className="form-links">
          <p>
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default RegisterPage;
