import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import ProjectFormModal from '../components/ProjectFormModal';
import toast from 'react-hot-toast';

function StatusBadge({ s }) {
  const map = { planning:'badge-info', active:'badge-success', on_hold:'badge-warning', completed:'badge-gray' };
  return <span className={`badge ${map[s]||'badge-gray'}`}>{s?.replace('_',' ')}</span>;
}

const SORT_OPTIONS = [
  { value: 'newest',     label: 'Newest first' },
  { value: 'title_asc',  label: 'Title (A–Z)' },
  { value: 'title_desc', label: 'Title (Z–A)' },
  { value: 'progress',   label: 'Progress (high → low)' },
  { value: 'end_date',   label: 'End date (soonest)' },
];

export default function Projects() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modalProject, setModalProject] = useState(undefined); // undefined = closed, null = create, object = edit
  const [search, setSearch]     = useState('');
  const [filter, setFilter]     = useState('all');
  const [sort, setSort]         = useState('newest');

  const load = async () => {
    try {
      const [pRes, uRes] = await Promise.all([
        api.get('/projects'),
        user.role === 'admin' ? api.get('/users') : Promise.resolve({ data:{ users:[] } })
      ]);
      setProjects(pRes.data.projects);
      setUsers(uRes.data.users);
    } catch(e) { toast.error('Failed to load projects'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const del = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Delete this project? This cannot be undone.')) return;
    try {
      await api.delete(`/projects/${id}`);
      toast.success('Project deleted');
      load();
    } catch(err) {
      // Surface *why* the deletion failed (e.g. a 403 from someone who
      // isn't an admin, or a 404 if it was already removed) instead of a
      // generic message, so the failure is actually actionable.
      toast.error(err.response?.data?.message || 'Delete failed — please try again');
    }
  };

  // Search matches title OR location — "Read" now covers location search,
  // not just title, as flagged in review.
  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = projects
      .filter(p => filter === 'all' || p.status === filter)
      .filter(p => !q || p.title.toLowerCase().includes(q) || (p.location || '').toLowerCase().includes(q));

    list = [...list].sort((a, b) => {
      switch (sort) {
        case 'title_asc':  return a.title.localeCompare(b.title);
        case 'title_desc': return b.title.localeCompare(a.title);
        case 'progress':   return (b.progress ?? 0) - (a.progress ?? 0);
        case 'end_date':   return new Date(a.endDate || '9999-12-31') - new Date(b.endDate || '9999-12-31');
        case 'newest':
        default:           return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
    });
    return list;
  }, [projects, search, filter, sort]);

  if (loading) return <div className="loading-center"><div className="spinner"/></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Projects</div>
          <div className="page-sub">{projects.length} total projects</div>
        </div>
        {user.role === 'admin' && <button className="btn btn-primary" onClick={() => setModalProject(null)}>+ New Project</button>}
      </div>

      <div className="flex gap-3 mb-4" style={{flexWrap:'wrap', alignItems:'center'}}>
        <input className="form-input" style={{maxWidth:280}} placeholder="🔍 Search by title or location…" value={search} onChange={e=>setSearch(e.target.value)}/>
        <select className="form-select" style={{maxWidth:220}} value={sort} onChange={e=>setSort(e.target.value)} aria-label="Sort projects">
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>Sort: {o.label}</option>)}
        </select>
        {['all','planning','active','on_hold','completed'].map(s => (
          <button key={s} className={`btn btn-sm ${filter===s?'btn-primary':'btn-secondary'}`} onClick={()=>setFilter(s)}>
            {s.replace('_',' ')}
          </button>
        ))}
      </div>

      {visible.length === 0
        ? <div className="empty-state"><div className="empty-icon">🏗️</div><p>No projects found.</p></div>
        : <div className="grid-3">
            {visible.map(p => (
              <div key={p._id} className="project-card" onClick={() => navigate(`/projects/${p._id}`)}>
                <div className="flex items-center justify-between" style={{marginBottom:8}}>
                  <StatusBadge s={p.status}/>
                  {user.role === 'admin' && (
                    <div className="flex gap-2">
                      <button className="btn-icon" title="Edit project"
                        onClick={e => { e.stopPropagation(); setModalProject(p); }}>✏️</button>
                      <button className="btn-icon" title="Delete project" style={{color:'var(--danger)'}}
                        onClick={e => del(p._id, e)}>🗑️</button>
                    </div>
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

      {modalProject !== undefined && (
        <ProjectFormModal
          project={modalProject}
          users={users}
          canAssignUsers={user.role === 'admin'}
          onClose={() => setModalProject(undefined)}
          onSaved={() => { setModalProject(undefined); load(); }}
        />
      )}
    </div>
  );
}
