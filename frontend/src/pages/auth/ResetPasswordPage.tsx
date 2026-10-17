import { useState } from 'react';
import type { FormEvent } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useResetPasswordMutation } from '../../store/api/authApi';
import PasswordInput from '../../components/PasswordInput';
import {
  validateEmail,
  validateOtp,
  validatePassword,
  validateConfirmPassword,
} from '../../utils/validation';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const stateEmail = (location.state as { email?: string })?.email || '';

  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const [email, setEmail] = useState(stateEmail);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [touched, setTouched] = useState({
    email: false,
    otp: false,
    newPassword: false,
    confirmPassword: false,
  });

  const emailError = touched.email ? validateEmail(email) : null;
  const otpError = touched.otp ? validateOtp(otp) : null;
  const newPasswordError = touched.newPassword
    ? validatePassword(newPassword)
    : null;
  const confirmPasswordError = touched.confirmPassword
    ? validateConfirmPassword(newPassword, confirmPassword)
    : null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setTouched({
      email: true,
      otp: true,
      newPassword: true,
      confirmPassword: true,
    });

    const eErr = validateEmail(email);
    const oErr = validateOtp(otp);
    const pErr = validatePassword(newPassword);
    const cpErr = validateConfirmPassword(newPassword, confirmPassword);

    if (eErr || oErr || pErr || cpErr) {
      toast.error(eErr || oErr || pErr || cpErr || 'Please check form errors');
      return;
    }

    try {
      // Only { email, otp, newPassword } sent to backend
      const res = await resetPassword({
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
        newPassword,
      }).unwrap();
      toast.success(res.data?.message || 'Password reset successfully!');
      navigate('/login');
    } catch (err: unknown) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ||
        'Reset failed';
      toast.error(message);
    }
  };

  return (
    <div className="centered">
      <form className="form-card" onSubmit={handleSubmit} noValidate>
        <h2>Reset Password</h2>

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
          <label htmlFor="otp">6-Digit OTP</label>
          <input
            id="otp"
            type="text"
            inputMode="numeric"
            value={otp}
            onChange={(e) =>
              setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
            }
            onBlur={() => setTouched((prev) => ({ ...prev, otp: true }))}
            placeholder="123456"
            maxLength={6}
            className={otpError ? 'input-error' : ''}
            aria-invalid={Boolean(otpError)}
            aria-describedby={otpError ? 'otp-error' : undefined}
            required
          />
          {otpError ? (
            <span id="otp-error" className="error-text">
              {otpError}
            </span>
          ) : (
            <span className="hint-text">Enter the 6-digit code received</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="newPassword">New Password</label>
          <PasswordInput
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            onBlur={() =>
              setTouched((prev) => ({ ...prev, newPassword: true }))
            }
            placeholder="Min 6 characters"
            autoComplete="new-password"
            minLength={6}
            isInvalid={Boolean(newPasswordError)}
            ariaDescribedBy={
              newPasswordError ? 'new-password-error' : undefined
            }
            required
          />
          {newPasswordError ? (
            <span id="new-password-error" className="error-text">
              {newPasswordError}
            </span>
          ) : (
            <span className="hint-text">Must be at least 6 characters</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm New Password</label>
          <PasswordInput
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onBlur={() =>
              setTouched((prev) => ({ ...prev, confirmPassword: true }))
            }
            placeholder="Re-enter new password"
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

        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? 'Resetting…' : 'Reset Password'}
        </button>

        <div className="form-links">
          <p>
            <Link to="/login">Back to Sign In</Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default ResetPasswordPage;
