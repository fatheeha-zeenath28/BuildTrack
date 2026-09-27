import { useState, useEffect } from 'react';
import api from '../api';
import toast from 'react-hot-toast';

function RoleBadge({ r }) {
  const map = { admin:'badge-danger', engineer:'badge-info', client:'badge-success' };
  return <span className={`badge ${map[r]||'badge-gray'}`}>{r}</span>;
}

export default function Users() {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('all');
  const [search, setSearch]   = useState('');
  const [editUser, setEditUser] = useState(null);

  const load = async () => {
    try {
      const { data } = await api.get('/users');
      setUsers(data.users);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const del = async id => {
    if (!confirm('Delete this user?')) return;
    try { await api.delete(`/users/${id}`); toast.success('User deleted'); load(); }
    catch { toast.error('Failed'); }
  };

  const updateRole = async (id, role) => {
    try { await api.put(`/users/${id}`, { role }); toast.success('Role updated'); load(); }
    catch { toast.error('Failed'); }
  };

  const filtered = users
    .filter(u => filter === 'all' || u.role === filter)
    .filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  const counts = { admin: users.filter(u=>u.role==='admin').length, engineer: users.filter(u=>u.role==='engineer').length, client: users.filter(u=>u.role==='client').length };

  if (loading) return <div className="loading-center"><div className="spinner"/></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">User Management</div>
          <div className="page-sub">{users.length} registered users</div>
        </div>
      </div>

      <div className="grid-3 mb-4">
        {[['👑','Admins', counts.admin,'#fff7ed'],['🔧','Engineers',counts.engineer,'#eff6ff'],['👤','Clients',counts.client,'#f0fdf4']].map(([icon,label,val,bg]) => (
          <div key={label} className="stat-card">
            <div className="stat-icon" style={{background:bg, fontSize:'1.4rem'}}>{icon}</div>
            <div><div className="stat-value">{val}</div><div className="stat-label">{label}</div></div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 mb-4" style={{flexWrap:'wrap'}}>
        <input className="form-input" style={{maxWidth:280}} placeholder="🔍 Search by name or email…"
          value={search} onChange={e => setSearch(e.target.value)}/>
        {['all','admin','engineer','client'].map(r => (
          <button key={r} className={`btn btn-sm ${filter===r?'btn-primary':'btn-secondary'}`} onClick={() => setFilter(r)}>
            {r.charAt(0).toUpperCase()+r.slice(1)}
          </button>
        ))}
      </div>

      <div className="card">
        <div className="card-body" style={{padding:0}}>
          {filtered.length === 0
            ? <div className="empty-state"><div className="empty-icon">👥</div><p>No users found</p></div>
            : <div className="table-wrap">
                <table>
                  <thead>
                    <tr><th>User</th><th>Email</th><th>Role</th><th>Joined</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {filtered.map(u => (
                      <tr key={u._id}>
                        <td>
                          <div className="flex items-center gap-2">
                            <div style={{width:36,height:36,borderRadius:'50%',background:'var(--primary)',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:'.875rem',flexShrink:0}}>
                              {u.name?.[0]?.toUpperCase()}
                            </div>
                            <span style={{fontWeight:600}}>{u.name}</span>
                          </div>
                        </td>
                        <td style={{color:'var(--muted)', fontSize:'.875rem'}}>{u.email}</td>
                        <td>
                          <select value={u.role} onChange={e => updateRole(u._id, e.target.value)}
                            style={{border:'1px solid var(--border)', borderRadius:6, padding:'4px 8px', fontSize:'.8rem', cursor:'pointer', background:'var(--surface)'}}>
                            <option value="client">Client</option>
                            <option value="engineer">Engineer</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td style={{fontSize:'.8rem', color:'var(--muted)'}}>{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td>
                          <button className="btn-icon" onClick={() => del(u._id)} style={{color:'var(--danger)'}}>🗑️</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
          }
        </div>
      </div>
    </div>
  );
}
