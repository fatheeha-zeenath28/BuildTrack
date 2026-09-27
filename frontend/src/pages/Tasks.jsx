import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

function StatusBadge({ s }) {
  const map = { pending:'badge-warning', in_progress:'badge-info', completed:'badge-success', blocked:'badge-danger' };
  return <span className={`badge ${map[s]||'badge-gray'}`}>{s?.replace('_',' ')}</span>;
}
function PriorityBadge({ p }) {
  const map = { low:'badge-gray', medium:'badge-info', high:'badge-warning', critical:'badge-danger' };
  return <span className={`badge ${map[p]||'badge-gray'}`}>{p}</span>;
}

export default function Tasks() {
  const { user } = useAuth();
  const [tasks, setTasks]         = useState([]);
  const [projects, setProjects]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState('all');

  const load = async () => {
    try {
      const [tRes, pRes] = await Promise.all([api.get('/tasks'), api.get('/projects')]);
      setTasks(tRes.data.tasks);
      setProjects(pRes.data.projects);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/tasks/${id}`, { status });
      toast.success('Status updated');
      load();
    } catch { toast.error('Failed'); }
  };

  const deleteTask = async id => {
    if (!confirm('Delete task?')) return;
    await api.delete(`/tasks/${id}`);
    toast.success('Deleted');
    load();
  };

  const filtered = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);

  if (loading) return <div className="loading-center"><div className="spinner"/></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Tasks</div>
          <div className="page-sub">{tasks.length} total tasks across all projects</div>
        </div>
      </div>

      <div className="flex gap-2 mb-4" style={{flexWrap:'wrap'}}>
        {['all','pending','in_progress','completed','blocked'].map(s => (
          <button key={s} className={`btn btn-sm ${filter===s?'btn-primary':'btn-secondary'}`} onClick={() => setFilter(s)}>
            {s.replace('_',' ')}
          </button>
        ))}
      </div>

      <div className="card">
        <div className="card-body" style={{padding:0}}>
          {filtered.length === 0
            ? <div className="empty-state"><div className="empty-icon">✅</div><p>No tasks found</p></div>
            : <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Task</th>
                      <th>Project</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Due Date</th>
                      {user.role !== 'client' && <th>Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(t => (
                      <tr key={t._id}>
                        <td>
                          <div style={{fontWeight:600}}>{t.title}</div>
                          {t.description && <div style={{fontSize:'.75rem', color:'var(--muted)'}}>{t.description}</div>}
                        </td>
                        <td style={{fontSize:'.8rem', color:'var(--muted)'}}>{t.project?.title || '—'}</td>
                        <td><PriorityBadge p={t.priority}/></td>
                        <td>
                          {user.role !== 'client'
                            ? <select value={t.status} onChange={e => updateStatus(t._id, e.target.value)}
                                style={{border:'1px solid var(--border)', borderRadius:6, padding:'4px 8px', fontSize:'.8rem', cursor:'pointer', background:'var(--surface)'}}>
                                <option value="pending">Pending</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed</option>
                                <option value="blocked">Blocked</option>
                              </select>
                            : <StatusBadge s={t.status}/>
                          }
                        </td>
                        <td style={{fontSize:'.8rem', color:'var(--muted)'}}>{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '—'}</td>
                        {user.role !== 'client' && (
                          <td>
                            {user.role === 'admin' && (
                              <button className="btn-icon" onClick={() => deleteTask(t._id)} style={{color:'var(--danger)'}}>🗑️</button>
                            )}
                          </td>
                        )}
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
