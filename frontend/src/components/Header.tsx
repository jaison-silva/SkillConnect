import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { clearCredentials } from '../store/slices/authSlice';
import { useLogoutMutation } from '../store/api/authApi';

export const Header = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [logout, { isLoading }] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logout().unwrap();
    } catch {
      // Even if network fails, clear client session
    }
    dispatch(clearCredentials());
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const homeLink = isAuthenticated
    ? user?.role === 'ADMIN'
      ? '/admin/users'
      : '/'
    : '/login';

  return (
    <header className="app-header">
      <div className="header-inner header-centered">
        {/* Brand / Logo Centered */}
        <Link to={homeLink} className="brand-logo" aria-label="Skill Connect Home">
          <svg
            className="brand-icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <span className="brand-name">
            Skill<span className="brand-highlight">Connect</span>
          </span>
        </Link>

        {/* User Navigation when logged in */}
        {isAuthenticated && (
          <nav className="header-right-nav" aria-label="User Navigation">
            <span className="user-greeting">
              <strong>{user?.name || 'User'}</strong>
            </span>
            <span className="badge badge-gray role-badge">{user?.role}</span>

            {user?.role === 'ADMIN' ? (
              <Link to="/admin/users" className="nav-link">
                CRM
              </Link>
            ) : (
              <Link to="/" className="nav-link">
                Dashboard
              </Link>
            )}

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleLogout}
              disabled={isLoading}
            >
              {isLoading ? '…' : 'Logout'}
            </button>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
