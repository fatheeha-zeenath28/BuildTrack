import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { fileUrl } from '../config';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

function StatusBadge({ s }) {
  const map = { planning:'badge-info', active:'badge-success', on_hold:'badge-warning', completed:'badge-gray', pending:'badge-warning', in_progress:'badge-info', blocked:'badge-danger' };
  return <span className={`badge ${map[s]||'badge-gray'}`}>{s?.replace('_',' ')}</span>;
}

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks]     = useState([]);
  const [reports, setReports] = useState([]);
  const [photos, setPhotos]   = useState([]);
  const [tab, setTab]         = useState('overview');
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  const load = async () => {
    try {
      const [pRes, tRes, rRes, phRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks?project=${id}`),
        api.get(`/reports?project=${id}`),
        api.get(`/photos?project=${id}`),
      ]);
      setProject(pRes.data.project);
      setProgress(pRes.data.project.progress);
      setTasks(tRes.data.tasks);
      setReports(rRes.data.reports);
      setPhotos(phRes.data.photos);
    } catch { navigate('/projects'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  const updateProgress = async () => {
    try {
      await api.put(`/projects/${id}`, { progress });
      toast.success('Progress updated!');
      load();
    } catch { toast.error('Failed to update'); }
  };

  const addTask = async e => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.target));
    try {
      await api.post('/tasks', { ...f, project: id });
      toast.success('Task added');
      e.target.reset();
      load();
    } catch { toast.error('Failed'); }
  };

  const addReport = async e => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.target));
    try {
      await api.post('/reports', { ...f, project: id });
      toast.success('Report added');
      e.target.reset();
      load();
    } catch { toast.error('Failed'); }
  };

  const uploadPhoto = async e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    fd.append('project', id);
    try {
      await api.post('/photos', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Photo uploaded');
      e.target.reset();
      load();
    } catch { toast.error('Upload failed'); }
  };

  const deleteTask = async tid => {
    if (!confirm('Delete task?')) return;
    await api.delete(`/tasks/${tid}`);
    toast.success('Task deleted');
    load();
  };

  const deleteReport = async rid => {
    if (!confirm('Delete report?')) return;
    await api.delete(`/reports/${rid}`);
    toast.success('Report deleted');
    load();
  };

  if (loading) return <div className="loading-center"><div className="spinner"/></div>;
  if (!project) return null;

  const canEdit = user.role === 'admin' || user.role === 'engineer';

  return (
    <div>
      <div className="page-header">
        <div>
          <button className="btn btn-sm btn-secondary" onClick={() => navigate('/projects')} style={{marginBottom:8}}>← Back</button>
          <div className="page-title">{project.title}</div>
          <div className="page-sub">📍 {project.location || 'No location set'}</div>
        </div>
        <StatusBadge s={project.status}/>
      </div>

      {/* Progress bar */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="flex items-center justify-between" style={{marginBottom:10}}>
            <span style={{fontWeight:700}}>Overall Progress</span>
            <span style={{fontWeight:800, fontSize:'1.2rem', color:'var(--primary)'}}>{project.progress}%</span>
          </div>
          <div className="progress-bar" style={{height:12}}>
            <div className="progress-fill" style={{width:`${project.progress}%`}}/>
          </div>
          {canEdit && (
            <div className="flex items-center gap-3 mt-4">
              <input type="range" min="0" max="100" value={progress} onChange={e => setProgress(+e.target.value)} style={{flex:1, accentColor:'var(--primary)'}}/>
              <span style={{minWidth:40, fontWeight:700}}>{progress}%</span>
              <button className="btn btn-primary btn-sm" onClick={updateProgress}>Update</button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {['overview','tasks','reports','photos'].map(t => (
          <button key={t} className={`tab-btn${tab===t?' active':''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase()+t.slice(1)}
            {t==='tasks'   && <span style={{marginLeft:6, background:'var(--bg)', padding:'1px 6px', borderRadius:999, fontSize:'.7rem'}}>{tasks.length}</span>}
            {t==='reports' && <span style={{marginLeft:6, background:'var(--bg)', padding:'1px 6px', borderRadius:999, fontSize:'.7rem'}}>{reports.length}</span>}
            {t==='photos'  && <span style={{marginLeft:6, background:'var(--bg)', padding:'1px 6px', borderRadius:999, fontSize:'.7rem'}}>{photos.length}</span>}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div className="grid-2">
          <div className="card">
            <div className="card-header"><span className="card-title">Project Details</span></div>
            <div className="card-body">
              {[['Description', project.description || '—'],
                ['Status', project.status?.replace('_',' ')],
                ['Budget', project.budget ? `$${Number(project.budget).toLocaleString()}` : '—'],
                ['Start Date', project.startDate ? new Date(project.startDate).toLocaleDateString() : '—'],
                ['End Date',   project.endDate   ? new Date(project.endDate).toLocaleDateString()   : '—'],
              ].map(([l,v]) => (
                <div key={l} style={{display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid var(--border)'}}>
                  <span style={{color:'var(--muted)', fontSize:'.875rem'}}>{l}</span>
                  <span style={{fontWeight:600, fontSize:'.875rem'}}>{v}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="card-header"><span className="card-title">Team</span></div>
            <div className="card-body">
              <div style={{marginBottom:12, fontSize:'.8rem', color:'var(--muted)', fontWeight:600}}>ENGINEERS</div>
              {project.engineers?.length === 0 && <p style={{color:'var(--muted)', fontSize:'.875rem'}}>No engineers assigned</p>}
              {project.engineers?.map(e => (
                <div key={e._id} className="flex items-center gap-2" style={{marginBottom:10}}>
                  <div style={{width:32,height:32,borderRadius:'50%',background:'var(--primary)',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:'.8rem'}}>{e.name?.[0]}</div>
                  <div><div style={{fontWeight:600, fontSize:'.875rem'}}>{e.name}</div><div style={{fontSize:'.75rem', color:'var(--muted)'}}>{e.email}</div></div>
                </div>
              ))}
              <div style={{margin:'16px 0 10px', fontSize:'.8rem', color:'var(--muted)', fontWeight:600}}>CLIENTS</div>
              {project.clients?.length === 0 && <p style={{color:'var(--muted)', fontSize:'.875rem'}}>No clients assigned</p>}
              {project.clients?.map(c => (
                <div key={c._id} className="flex items-center gap-2" style={{marginBottom:10}}>
                  <div style={{width:32,height:32,borderRadius:'50%',background:'var(--accent)',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:'.8rem'}}>{c.name?.[0]}</div>
                  <div><div style={{fontWeight:600, fontSize:'.875rem'}}>{c.name}</div><div style={{fontSize:'.75rem', color:'var(--muted)'}}>{c.email}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tasks */}
      {tab === 'tasks' && (
        <div>
          {canEdit && (
            <div className="card mb-4">
              <div className="card-header"><span className="card-title">Add Task</span></div>
              <div className="card-body">
                <form onSubmit={addTask}>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Title *</label>
                      <input className="form-input" name="title" required placeholder="Task title"/>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Priority</label>
                      <select className="form-select" name="priority">
                        <option value="low">Low</option>
                        <option value="medium" selected>Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Status</label>
                      <select className="form-select" name="status">
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="blocked">Blocked</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Due Date</label>
                      <input className="form-input" type="date" name="dueDate"/>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <input className="form-input" name="description" placeholder="Optional description"/>
                  </div>
                  <button type="submit" className="btn btn-primary btn-sm">Add Task</button>
                </form>
              </div>
            </div>
          )}
          <div className="card">
            <div className="card-body" style={{padding:0}}>
              {tasks.length === 0
                ? <div className="empty-state"><div className="empty-icon">✅</div><p>No tasks yet</p></div>
                : <div className="table-wrap">
                    <table>
                      <thead><tr><th>Task</th><th>Priority</th><th>Status</th><th>Due Date</th>{canEdit&&<th></th>}</tr></thead>
                      <tbody>
                        {tasks.map(t => (
                          <tr key={t._id}>
                            <td><div style={{fontWeight:600}}>{t.title}</div><div style={{fontSize:'.75rem',color:'var(--muted)'}}>{t.description}</div></td>
                            <td><PriorityBadge p={t.priority}/></td>
                            <td><StatusBadge s={t.status}/></td>
                            <td style={{fontSize:'.8rem',color:'var(--muted)'}}>{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '—'}</td>
                            {canEdit && <td><button className="btn-icon" onClick={() => deleteTask(t._id)}>🗑️</button></td>}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
              }
            </div>
          </div>
        </div>
      )}

      {/* Reports */}
      {tab === 'reports' && (
        <div>
          {canEdit && (
            <div className="card mb-4">
              <div className="card-header"><span className="card-title">Add Daily Report</span></div>
              <div className="card-body">
                <form onSubmit={addReport}>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Title *</label>
                      <input className="form-input" name="title" required placeholder="Daily Site Report – Day 12"/>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Weather</label>
                      <input className="form-input" name="weather" placeholder="Sunny, 28°C"/>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Content *</label>
                    <textarea className="form-textarea" name="content" required placeholder="Describe today's activities, progress made, and any notes…"/>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Workers on Site</label>
                    <input className="form-input" type="number" name="workers" placeholder="0" style={{maxWidth:120}}/>
                  </div>
                  <button type="submit" className="btn btn-primary btn-sm">Submit Report</button>
                </form>
              </div>
            </div>
          )}
          {reports.length === 0
            ? <div className="empty-state"><div className="empty-icon">📋</div><p>No reports yet</p></div>
            : reports.map(r => (
              <div key={r._id} className="card mb-4">
                <div className="card-header">
                  <div>
                    <span className="card-title">{r.title}</span>
                    <div style={{fontSize:'.75rem', color:'var(--muted)', marginTop:4}}>
                      By {r.author?.name} · {new Date(r.reportDate).toLocaleDateString()}
                      {r.weather && ` · 🌤 ${r.weather}`}
                      {r.workers > 0 && ` · 👷 ${r.workers} workers`}
                    </div>
                  </div>
                  {user.role === 'admin' && <button className="btn-icon" onClick={() => deleteReport(r._id)}>🗑️</button>}
                </div>
                <div className="card-body" style={{paddingTop:12}}>
                  <p style={{fontSize:'.875rem', color:'var(--text)', lineHeight:1.7}}>{r.content}</p>
                </div>
              </div>
            ))
          }
        </div>
      )}

      {/* Photos */}
      {tab === 'photos' && (
        <div>
          {canEdit && (
            <div className="card mb-4">
              <div className="card-header"><span className="card-title">Upload Photo</span></div>
              <div className="card-body">
                <form onSubmit={uploadPhoto}>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Photo *</label>
                      <input className="form-input" type="file" name="photo" accept="image/*" required/>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Category</label>
                      <select className="form-select" name="category">
                        <option value="progress">Progress</option>
                        <option value="issue">Issue</option>
                        <option value="completion">Completion</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Caption</label>
                    <input className="form-input" name="caption" placeholder="Brief description of the photo"/>
                  </div>
                  <button type="submit" className="btn btn-primary btn-sm">Upload</button>
                </form>
              </div>
            </div>
          )}
          {photos.length === 0
            ? <div className="empty-state"><div className="empty-icon">📷</div><p>No photos uploaded yet</p></div>
            : <div className="grid-3">
                {photos.map(p => (
                  <div key={p._id} className="card" style={{overflow:'hidden'}}>
                    <img src={fileUrl(p.url)} alt={p.caption} style={{width:'100%', height:180, objectFit:'cover'}}/>
                    <div style={{padding:'12px 16px'}}>
                      <div style={{fontWeight:600, fontSize:'.875rem'}}>{p.caption || 'No caption'}</div>
                      <div style={{fontSize:'.75rem', color:'var(--muted)', marginTop:4}}>
                        <span className="badge badge-info">{p.category}</span>
                        <span style={{marginLeft:8}}>By {p.uploadedBy?.name}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
          }
        </div>
      )}
    </div>
  );
}

function PriorityBadge({ p }) {
  const map = { low:'badge-gray', medium:'badge-info', high:'badge-warning', critical:'badge-danger' };
  return <span className={`badge ${map[p]||'badge-gray'}`}>{p}</span>;
}
