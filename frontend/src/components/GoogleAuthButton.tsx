import { GoogleLogin } from '@react-oauth/google';
import type { CredentialResponse } from '@react-oauth/google';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useGoogleAuthMutation } from '../store/api/authApi';
import { setCredentials } from '../store/slices/authSlice';
import { useAppDispatch } from '../store/hooks';
import type { UserRole } from '../types';

interface GoogleAuthButtonProps {
  mode: 'login' | 'signup';
  role?: UserRole;
}

export const GoogleAuthButton = ({ mode, role }: GoogleAuthButtonProps) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [googleAuth, { isLoading }] = useGoogleAuthMutation();

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const isConfigured =
    Boolean(clientId) &&
    clientId !== 'your_google_client_id_here.apps.googleusercontent.com';

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      toast.error('No credential received from Google.');
      return;
    }

    try {
      const res = await googleAuth({
        credential: credentialResponse.credential,
        role: mode === 'signup' ? role : undefined,
      }).unwrap();

      const { user, accessToken } = res.data;
      dispatch(setCredentials({ user, accessToken }));
      toast.success(
        mode === 'signup'
          ? `Welcome to SkillConnect, ${user.name}!`
          : `Welcome back, ${user.name}!`
      );
      navigate(user.role === 'ADMIN' ? '/admin/users' : '/', { replace: true });
    } catch (err: unknown) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ||
        'Google authentication failed. Please try again.';
      toast.error(message);
    }
  };

  const handleError = () => {
    toast.error('Google Sign-In failed or was closed. Please try again.');
  };

  return (
    <div className="google-auth-container">
      <div className="auth-divider">
        <span>or</span>
      </div>

      {!isConfigured && (
        <div className="google-config-hint">
          <small>
            ℹ️ To enable Google Sign-In, configure <code>VITE_GOOGLE_CLIENT_ID</code> in <code>frontend/.env</code> and <code>GOOGLE_CLIENT_ID</code> in <code>backend/.env</code>.
          </small>
        </div>
      )}

      <div className={`google-btn-wrapper ${isLoading ? 'loading' : ''}`}>
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={handleError}
          text={mode === 'signup' ? 'signup_with' : 'signin_with'}
          shape="rectangular"
          theme="outline"
          size="large"
          width="100%"
        />
      </div>
    </div>
  );
};

export default GoogleAuthButton;
