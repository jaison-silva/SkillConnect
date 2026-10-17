import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  useGetUsersQuery,
  useToggleBlockUserMutation,
} from '../../store/api/crmApi';
import type { UserRole, CrmQueryParams } from '../../types';

type SortField = 'createdAt' | 'name' | 'email' | 'strikeCount';
type SortOrder = 'asc' | 'desc';

const UsersPage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('');
  const [isVerified, setIsVerified] = useState<string>('');
  const [isBlocked, setIsBlocked] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const queryParams: CrmQueryParams = {
    page,
    limit: 10,
    sortBy,
    sortOrder,
  };
  if (search) queryParams.search = search;
  if (roleFilter) queryParams.role = roleFilter;
  if (isVerified) queryParams.isVerified = isVerified;
  if (isBlocked) queryParams.isBlocked = isBlocked;

  const { data, isLoading, isFetching } = useGetUsersQuery(queryParams);
  const [toggleBlock] = useToggleBlockUserMutation();

  const result = data?.data;

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setPage(1);
  };

  const sortIndicator = (field: SortField) => {
    if (sortBy !== field) return '';
    return sortOrder === 'asc' ? ' ↑' : ' ↓';
  };

  const handleToggleBlock = async (userId: string) => {
    try {
      const res = await toggleBlock(userId).unwrap();
      toast.success(res.data.message);
    } catch (err: unknown) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ||
        'Action failed';
      toast.error(message);
    }
  };

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h2>User Management (Admin CRM)</h2>
        <Link to="/" className="btn btn-secondary btn-sm">
          ← Back to Dashboard
        </Link>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="form-group">
          <label>Search</label>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Name or email…"
          />
        </div>

        <div className="form-group">
          <label>Role</label>
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value as UserRole | '');
              setPage(1);
            }}
          >
            <option value="">All Roles</option>
            <option value="CLIENT">Client</option>
            <option value="PROVIDER">Provider</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        <div className="form-group">
          <label>Verified</label>
          <select
            value={isVerified}
            onChange={(e) => {
              setIsVerified(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>

        <div className="form-group">
          <label>Blocked</label>
          <select
            value={isBlocked}
            onChange={(e) => {
              setIsBlocked(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        {isLoading ? (
          <p style={{ padding: '2rem', textAlign: 'center' }}>Loading…</p>
        ) : (
          <>
            <table style={{ opacity: isFetching ? 0.6 : 1 }}>
              <thead>
                <tr>
                  <th onClick={() => handleSort('name')}>
                    Name{sortIndicator('name')}
                  </th>
                  <th onClick={() => handleSort('email')}>
                    Email{sortIndicator('email')}
                  </th>
                  <th>Role</th>
                  <th>Verified</th>
                  <th>Blocked</th>
                  <th onClick={() => handleSort('strikeCount')}>
                    Strikes{sortIndicator('strikeCount')}
                  </th>
                  <th onClick={() => handleSort('createdAt')}>
                    Joined{sortIndicator('createdAt')}
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {result?.users?.length ? (
                  result.users.map((u) => (
                    <tr key={u._id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>
                        <span className="badge badge-gray">{u.role}</span>
                      </td>
                      <td>
                        <span
                          className={`badge ${u.isVerified ? 'badge-green' : 'badge-red'}`}
                        >
                          {u.isVerified ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge ${u.isBlocked ? 'badge-red' : 'badge-green'}`}
                        >
                          {u.isBlocked ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td>{u.strikeCount}</td>
                      <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td>
                        {u.role !== 'ADMIN' && (
                          <button
                            className={`btn btn-sm ${u.isBlocked ? 'btn-success' : 'btn-danger'}`}
                            onClick={() => handleToggleBlock(u._id)}
                          >
                            {u.isBlocked ? 'Unblock' : 'Block'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '2rem' }}>
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {result && (
              <div className="pagination">
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  ← Previous
                </button>
                <span>
                  Page {result.currentPage} of {result.totalPages} ({result.totalUsers} users)
                </span>
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={page >= result.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UsersPage;
