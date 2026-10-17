import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useLogoutMutation } from '../store/api/authApi';
import { clearCredentials } from '../store/slices/authSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [logout, { isLoading }] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logout().unwrap();
    } catch {
      // Even if the API call fails, we still clear local state
    }
    dispatch(clearCredentials());
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <div className="page-container">
      <div className="dashboard-card">
        <h1>Welcome{user?.name ? `, ${user.name}` : ''}!</h1>
        <p>
          Role: <span className="badge badge-green">{user?.role}</span>
        </p>

        <div className="actions">
          {user?.role === 'ADMIN' && (
            <Link to="/admin/users" className="btn btn-primary" style={{ width: 'auto' }}>
              Manage Users
            </Link>
          )}
          <button
            className="btn btn-danger"
            onClick={handleLogout}
            disabled={isLoading}
          >
            {isLoading ? 'Logging out…' : 'Logout'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
