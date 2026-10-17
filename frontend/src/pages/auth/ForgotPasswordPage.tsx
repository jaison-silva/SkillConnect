import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useForgotPasswordMutation } from '../../store/api/authApi';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const [email, setEmail] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await forgotPassword({ email }).unwrap();
      if (res.data?.debugOtp) {
        toast.success(`Reset OTP (dev): ${res.data.debugOtp}`, {
          duration: 10000,
        });
      } else {
        toast.success(res.data?.message || 'Password reset OTP sent.');
      }
      navigate('/reset-password', { state: { email } });
    } catch (err: unknown) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ||
        'Request failed';
      toast.error(message);
    }
  };

  return (
    <div className="centered">
      <form className="form-card" onSubmit={handleSubmit}>
        <h2>Forgot Password</h2>

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
