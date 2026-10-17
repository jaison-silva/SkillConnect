import { useState } from 'react';
import type { FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  useVerifyOtpMutation,
  useResendOtpMutation,
} from '../../store/api/authApi';

const VerifyOtpPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const stateEmail = (location.state as { email?: string })?.email || '';

  const [email, setEmail] = useState(stateEmail);
  const [otp, setOtp] = useState('');

  const [verifyOtp, { isLoading: isVerifying }] = useVerifyOtpMutation();
  const [resendOtp, { isLoading: isResending }] = useResendOtpMutation();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await verifyOtp({ email, otp }).unwrap();
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
    if (!email) {
      toast.error('Enter your email first');
      return;
    }
    try {
      const res = await resendOtp({ email }).unwrap();
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
      <form className="form-card" onSubmit={handleSubmit}>
        <h2>Verify OTP</h2>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="otp">6-Digit OTP</label>
          <input
            id="otp"
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="123456"
            maxLength={6}
            required
          />
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
        </div>
      </form>
    </div>
  );
};

export default VerifyOtpPage;
