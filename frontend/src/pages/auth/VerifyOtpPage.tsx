import { useState } from 'react';
import type { FormEvent } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  useVerifyOtpMutation,
  useResendOtpMutation,
} from '../../store/api/authApi';
import { validateEmail, validateOtp } from '../../utils/validation';

const VerifyOtpPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const stateEmail = (location.state as { email?: string })?.email || '';

  const [email, setEmail] = useState(stateEmail);
  const [otp, setOtp] = useState('');

  const [touched, setTouched] = useState({
    email: false,
    otp: false,
  });

  const [verifyOtp, { isLoading: isVerifying }] = useVerifyOtpMutation();
  const [resendOtp, { isLoading: isResending }] = useResendOtpMutation();

  const emailError = touched.email ? validateEmail(email) : null;
  const otpError = touched.otp ? validateOtp(otp) : null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setTouched({ email: true, otp: true });

    const eErr = validateEmail(email);
    const oErr = validateOtp(otp);

    if (eErr || oErr) {
      toast.error(eErr || oErr || 'Please check form errors');
      return;
    }

    try {
      const res = await verifyOtp({
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
      }).unwrap();
      toast.success(res.data?.message || 'Account verified!');
      navigate('/login');
    } catch (err: unknown) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ||
        'Verification failed';
      toast.error(message);
    }
  };

  const handleResend = async () => {
    setTouched((prev) => ({ ...prev, email: true }));
    const eErr = validateEmail(email);
    if (eErr) {
      toast.error(eErr);
      return;
    }

    try {
      const res = await resendOtp({
        email: email.trim().toLowerCase(),
      }).unwrap();
      if (res.data?.debugOtp) {
        toast.success(`New OTP (dev): ${res.data.debugOtp}`, { duration: 10000 });
      } else {
        toast.success(res.data?.message || 'OTP resent successfully');
      }
    } catch (err: unknown) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ||
        'Failed to resend OTP';
      toast.error(message);
    }
  };

  return (
    <div className="centered">
      <form className="form-card" onSubmit={handleSubmit} noValidate>
        <h2>Verify OTP</h2>

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

        <button type="submit" className="btn btn-primary" disabled={isVerifying}>
          {isVerifying ? 'Verifying…' : 'Verify'}
        </button>

        <div className="form-links" style={{ marginTop: '1rem' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleResend}
            disabled={isResending}
          >
            {isResending ? 'Sending…' : 'Resend OTP'}
          </button>
          <p style={{ marginTop: '0.75rem' }}>
            <Link to="/login">Back to Sign In</Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default VerifyOtpPage;
