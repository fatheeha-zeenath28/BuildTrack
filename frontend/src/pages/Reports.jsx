import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Reports() {
  const { user } = useAuth();
  const [reports, setReports]   = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('all');

  const load = async () => {
    try {
      const [rRes, pRes] = await Promise.all([api.get('/reports'), api.get('/projects')]);
      setReports(rRes.data.reports);
      setProjects(pRes.data.projects);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const del = async id => {
    if (!confirm('Delete report?')) return;
    await api.delete(`/reports/${id}`);
    toast.success('Deleted');
    load();
  };

  const filtered = filter === 'all' ? reports : reports.filter(r => r.project?._id === filter);

  if (loading) return <div className="loading-center"><div className="spinner"/></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Site Reports</div>
          <div className="page-sub">{reports.length} reports submitted</div>
        </div>
      </div>

      <div className="flex gap-2 mb-4" style={{flexWrap:'wrap'}}>
        <button className={`btn btn-sm ${filter==='all'?'btn-primary':'btn-secondary'}`} onClick={() => setFilter('all')}>All Projects</button>
        {projects.map(p => (
          <button key={p._id} className={`btn btn-sm ${filter===p._id?'btn-primary':'btn-secondary'}`} onClick={() => setFilter(p._id)}>
            {p.title.slice(0,20)}
          </button>
        ))}
      </div>

      {filtered.length === 0
        ? <div className="empty-state"><div className="empty-icon">📋</div><p>No reports found</p></div>
        : filtered.map(r => (
          <div key={r._id} className="card mb-4">
            <div className="card-header">
              <div>
                <span className="card-title">{r.title}</span>
                <div style={{marginTop:6, display:'flex', gap:12, flexWrap:'wrap', fontSize:'.78rem', color:'var(--muted)'}}>
                  <span>📁 {r.project?.title}</span>
                  <span>👤 {r.author?.name}</span>
                  <span>📅 {new Date(r.reportDate).toLocaleDateString()}</span>
                  {r.weather  && <span>🌤 {r.weather}</span>}
                  {r.workers > 0 && <span>👷 {r.workers} workers</span>}
                </div>
              </div>
              {user.role === 'admin' && (
                <button className="btn-icon" onClick={() => del(r._id)} style={{color:'var(--danger)'}}>🗑️</button>
              )}
            </div>
            <div className="card-body" style={{paddingTop:12}}>
              <p style={{fontSize:'.875rem', lineHeight:1.8}}>{r.content}</p>
              {r.issues?.length > 0 && (
                <div style={{marginTop:16}}>
                  <div style={{fontWeight:700, fontSize:'.8rem', color:'var(--muted)', marginBottom:8}}>REPORTED ISSUES</div>
                  {r.issues.map((iss, i) => (
                    <div key={i} style={{display:'flex', alignItems:'center', gap:10, padding:'8px 12px', background:'#fff1f2', borderRadius:8, marginBottom:6}}>
                      <span>⚠️</span>
                      <span style={{fontSize:'.875rem'}}>{iss.description}</span>
                      <span className={`badge ${iss.severity==='high'?'badge-danger':iss.severity==='medium'?'badge-warning':'badge-gray'}`}>{iss.severity}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))
      }
    </div>
  );
}
