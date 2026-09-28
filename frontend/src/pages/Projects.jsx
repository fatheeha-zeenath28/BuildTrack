import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

function StatusBadge({ s }) {
  const map = { planning:'badge-info', active:'badge-success', on_hold:'badge-warning', completed:'badge-gray' };
  return <span className={`badge ${map[s]||'badge-gray'}`}>{s?.replace('_',' ')}</span>;
}

function Modal({ onClose, onSaved, users }) {
  const { user } = useAuth();
  const [form, setForm] = useState({ title:'', description:'', location:'', status:'planning', startDate:'', endDate:'', budget:'', engineers:[], clients:[] });
  const [saving, setSaving] = useState(false);

  const engineers = users.filter(u => u.role === 'engineer');
  const clients   = users.filter(u => u.role === 'client');

  const save = async e => {
    e.preventDefault();
    if (form.startDate && form.endDate && form.endDate < form.startDate) {
    toast.error('End date cannot be earlier than start date');
    return;
  }
    setSaving(true);
    try {
      await api.post('/projects', form);
      toast.success('Project created!');
      onSaved();
    } catch(err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">New Project</span>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <form onSubmit={save}>
            <div className="form-group">
              <label className="form-label">Project Title *</label>
              <input className="form-input" required value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="e.g. Highway Bridge Project"/>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Project overview…"/>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Location</label>
                <input className="form-input" value={form.location} onChange={e=>setForm({...form,location:e.target.value})} placeholder="City, Country"/>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="on_hold">On Hold</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Start Date</label>
                <input className="form-input" type="date" value={form.startDate} onChange={e=>setForm({...form,startDate:e.target.value})}/>
              </div>
              <div className="form-group">
                <label className="form-label">End Date</label>
                <input className="form-input" type="date" value={form.endDate} onChange={e=>setForm({...form,endDate:e.target.value})}/>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Budget ($)</label>
              <input className="form-input" type="number" value={form.budget} onChange={e=>setForm({...form,budget:e.target.value})} placeholder="0"/>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Assign Engineers</label>
                <select className="form-select" multiple value={form.engineers} onChange={e=>setForm({...form,engineers:[...e.target.selectedOptions].map(o=>o.value)})}>
                  {engineers.map(u=><option key={u._id} value={u._id}>{u.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Assign Clients</label>
                <select className="form-select" multiple value={form.clients} onChange={e=>setForm({...form,clients:[...e.target.selectedOptions].map(o=>o.value)})}>
                  {clients.map(u=><option key={u._id} value={u._id}>{u.name}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-4" style={{justifyContent:'flex-end'}}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Create Project'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function Projects() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch]     = useState('');
  const [filter, setFilter]     = useState('all');

  const load = async () => {
    try {
      const [pRes, uRes] = await Promise.all([
        api.get('/projects'),
        user.role === 'admin' ? api.get('/users') : Promise.resolve({ data:{ users:[] } })
      ]);
      setProjects(pRes.data.projects);
      setUsers(uRes.data.users);
    } catch(e) { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const del = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Delete this project?')) return;
    try { await api.delete(`/projects/${id}`); toast.success('Deleted'); load(); }
    catch(err) { toast.error('Delete failed'); }
  };

  const filtered = projects
    .filter(p => filter === 'all' || p.status === filter)
    .filter(p => p.title.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="loading-center"><div className="spinner"/></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Projects</div>
          <div className="page-sub">{projects.length} total projects</div>
        </div>
        {user.role === 'admin' && <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Project</button>}
      </div>

      <div className="flex gap-3 mb-4" style={{flexWrap:'wrap'}}>
        <input className="form-input" style={{maxWidth:280}} placeholder="🔍 Search projects…" value={search} onChange={e=>setSearch(e.target.value)}/>
        {['all','planning','active','on_hold','completed'].map(s => (
          <button key={s} className={`btn btn-sm ${filter===s?'btn-primary':'btn-secondary'}`} onClick={()=>setFilter(s)}>
            {s.replace('_',' ')}
          </button>
        ))}
      </div>

      {filtered.length === 0
        ? <div className="empty-state"><div className="empty-icon">🏗️</div><p>No projects found.</p></div>
        : <div className="grid-3">
            {filtered.map(p => (
              <div key={p._id} className="project-card" onClick={() => navigate(`/projects/${p._id}`)}>
                <div className="flex items-center justify-between" style={{marginBottom:8}}>
                  <StatusBadge s={p.status}/>
                  {user.role === 'admin' && (
                    <button className="btn-icon" onClick={e => del(p._id, e)} style={{color:'var(--danger)'}}>🗑️</button>
                  )}
                </div>
                <div className="project-title">{p.title}</div>
                <div className="project-meta">
                  {p.location && <span className="text-sm text-muted">📍 {p.location}</span>}
                  {p.endDate  && <span className="text-sm text-muted">📅 {new Date(p.endDate).toLocaleDateString()}</span>}
                </div>
                <div style={{marginBottom:8}}>
                  <div className="flex items-center justify-between" style={{marginBottom:6}}>
                    <span style={{fontSize:'.8rem', color:'var(--muted)'}}>Progress</span>
                    <span style={{fontSize:'.8rem', fontWeight:700}}>{p.progress}%</span>
                  </div>
                  <div className="progress-bar"><div className="progress-fill" style={{width:`${p.progress}%`}}/></div>
                </div>
                <div className="flex gap-2" style={{marginTop:12}}>
                  {p.engineers?.slice(0,3).map(e => (
                    <div key={e._id} title={e.name} style={{width:28,height:28,borderRadius:'50%',background:'var(--primary)',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'.7rem',fontWeight:700}}>
                      {e.name?.[0]}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
      }

      {showModal && <Modal onClose={() => setShowModal(false)} onSaved={() => { setShowModal(false); load(); }} users={users}/>}
    </div>
  );
}
