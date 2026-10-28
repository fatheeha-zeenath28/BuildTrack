
import { useState, useEffect } from 'react';
import api from '../api';
import toast from 'react-hot-toast';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const load = async () => {
    try {
      const { data } = await api.get('/users');
      setUsers(data.users);
    } catch (error) {
      console.error('Failed to load users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const del = async (id) => {
    if (!window.confirm('Delete this user?')) return;

    try {
      await api.delete(`/users/${id}`);
      toast.success('User deleted');
      await load();
    } catch {
      toast.error('Failed to delete user');
    }
  };

  const updateRole = async (id, role) => {
    try {
      await api.put(`/users/${id}`, { role });
      toast.success('Role updated');
      await load();
    } catch {
      toast.error('Failed to update role');
    }
  };

  const filtered = users
    .filter((u) => filter === 'all' || u.role === filter)
    .filter(
      (u) =>
        (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(search.toLowerCase())
    );

  const counts = {
    admin: users.filter((u) => u.role === 'admin').length,
    engineer: users.filter((u) => u.role === 'engineer').length,
    client: users.filter((u) => u.role === 'client').length,
  };

  if (loading) {
    return (
      <div className="loading-center">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="users-background">
      <div className="users-content">
        <div className="page-header">
          <div>
            <div className="page-title">User Management</div>
            <div className="page-sub">
              {users.length} registered users
            </div>
          </div>
        </div>

        <div className="grid-3 users-stat-grid">
          {[
            ['👑', 'Admins', counts.admin, 'admin'],
            ['🔧', 'Engineers', counts.engineer, 'engineer'],
            ['👤', 'Clients', counts.client, 'client'],
          ].map(([icon, label, val, role]) => (
            <div className="stat-card users-glass-stat" key={role}>
              <div className={`stat-icon users-icon-${role}`}>
                {icon}
              </div>
              <div>
                <div className="stat-value">{val}</div>
                <div className="stat-label">{label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="users-toolbar">
          <input
            className="form-input users-search"
            placeholder="🔍 Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="users-filters">
            {['all', 'admin', 'engineer', 'client'].map((r) => (
              <button
                key={r}
                className={`btn btn-sm ${
                  filter === r ? 'btn-primary' : 'btn-secondary'
                }`}
                onClick={() => setFilter(r)}
              >
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="card users-glass-table">
          <div className="card-body" style={{ padding: 0 }}>
            {filtered.length === 0 ? (
              <div className="empty-state users-empty">
                <div className="empty-icon">👥</div>
                <p>No users found</p>
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((u) => (
                      <tr key={u._id}>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="users-avatar">
                              {u.name?.[0]?.toUpperCase() || '?'}
                            </div>
                            <span className="users-name">{u.name}</span>
                          </div>
                        </td>
                        <td className="users-email">{u.email}</td>
                        <td>
                          <select
                            value={u.role}
                            onChange={(e) =>
                              updateRole(u._id, e.target.value)
                            }
                            className="users-role-select"
                          >
                            <option value="client">Client</option>
                            <option value="engineer">Engineer</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="users-joined">
                          {u.createdAt
                            ? new Date(u.createdAt).toLocaleDateString()
                            : '—'}
                        </td>
                        <td>
                          <button
                            className="btn-icon"
                            onClick={() => del(u._id)}
                            style={{ color: 'var(--danger)' }}
                            title="Delete user"
                            aria-label={`Delete ${u.name}`}
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
