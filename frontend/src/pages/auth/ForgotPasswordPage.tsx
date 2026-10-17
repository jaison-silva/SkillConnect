import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useForgotPasswordMutation } from '../../store/api/authApi';
import { validateEmail } from '../../utils/validation';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);

  const emailError = touched ? validateEmail(email) : null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);

    const eErr = validateEmail(email);
    if (eErr) {
      toast.error(eErr);
      return;
    }

    try {
      const res = await forgotPassword({
        email: email.trim().toLowerCase(),
      }).unwrap();
      if (res.data?.debugOtp) {
        toast.success(`Reset OTP (dev): ${res.data.debugOtp}`, {
          duration: 10000,
        });
      } else {
        toast.success(res.data?.message || 'Password reset OTP sent.');
      }
      navigate('/reset-password', {
        state: { email: email.trim().toLowerCase() },
      });
    } catch (err: unknown) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ||
        'Request failed';
      toast.error(message);
    }
  };

  return (
    <div className="centered">
      <form className="form-card" onSubmit={handleSubmit} noValidate>
        <h2>Forgot Password</h2>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched(true)}
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

        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? 'Sending…' : 'Send Reset OTP'}
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

export default ForgotPasswordPage;
