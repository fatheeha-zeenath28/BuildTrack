import { useState, useEffect } from 'react';
import api from '../api';
import { fileUrl } from '../config';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Photos() {
  const { user } = useAuth();
  const [photos, setPhotos]     = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('all');
  const [lightbox, setLightbox] = useState(null);

  const load = async () => {
    try {
      const [phRes, pRes] = await Promise.all([api.get('/photos'), api.get('/projects')]);
      setPhotos(phRes.data.photos);
      setProjects(pRes.data.projects);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const del = async id => {
    if (!confirm('Delete photo?')) return;
    await api.delete(`/photos/${id}`);
    toast.success('Deleted');
    load();
  };

  const filtered = filter === 'all' ? photos : photos.filter(p => p.project?._id === filter || p.category === filter);

  if (loading) return <div className="loading-center"><div className="spinner"/></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Site Photos</div>
          <div className="page-sub">{photos.length} photos uploaded</div>
        </div>
      </div>

      <div className="flex gap-2 mb-4" style={{flexWrap:'wrap'}}>
        <button className={`btn btn-sm ${filter==='all'?'btn-primary':'btn-secondary'}`} onClick={() => setFilter('all')}>All</button>
        {['progress','issue','completion','other'].map(c => (
          <button key={c} className={`btn btn-sm ${filter===c?'btn-primary':'btn-secondary'}`} onClick={() => setFilter(c)}>
            {c.charAt(0).toUpperCase()+c.slice(1)}
          </button>
        ))}
        {projects.map(p => (
          <button key={p._id} className={`btn btn-sm ${filter===p._id?'btn-primary':'btn-secondary'}`} onClick={() => setFilter(p._id)}>
            📁 {p.title.slice(0,16)}
          </button>
        ))}
      </div>

      {filtered.length === 0
        ? <div className="empty-state"><div className="empty-icon">📷</div><p>No photos found</p></div>
        : <div className="grid-3">
            {filtered.map(p => (
              <div key={p._id} className="card" style={{overflow:'hidden', cursor:'pointer'}}>
                <div style={{position:'relative'}} onClick={() => setLightbox(p)}>
                  <img src={fileUrl(p.url)} alt={p.caption}
                    style={{width:'100%', height:200, objectFit:'cover', display:'block'}}
                    onError={e => { e.target.style.background='#f1f5f9'; e.target.style.height='200px'; e.target.src=''; }}
                  />
                  <div style={{position:'absolute', top:10, right:10}}>
                    <span className={`badge ${p.category==='issue'?'badge-danger':p.category==='completion'?'badge-success':'badge-info'}`}>{p.category}</span>
                  </div>
                </div>
                <div style={{padding:'12px 16px'}}>
                  <div style={{fontWeight:600, fontSize:'.875rem', marginBottom:4}}>{p.caption || 'No caption'}</div>
                  <div style={{fontSize:'.75rem', color:'var(--muted)', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    <span>By {p.uploadedBy?.name} · {p.project?.title?.slice(0,16)}</span>
                    {(user.role === 'admin' || user.role === 'engineer') && (
                      <button className="btn-icon" onClick={() => del(p._id)} style={{color:'var(--danger)', fontSize:'.9rem'}}>🗑️</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
      }

      {/* Lightbox */}
      {lightbox && (
        <div className="modal-overlay" onClick={() => setLightbox(null)}>
          <div style={{maxWidth:900, width:'100%', background:'#000', borderRadius:16, overflow:'hidden', position:'relative'}}>
            <img src={fileUrl(lightbox.url)} alt={lightbox.caption} style={{width:'100%', maxHeight:'80vh', objectFit:'contain'}}/>
            <div style={{padding:'12px 20px', background:'rgba(0,0,0,.8)', color:'#fff'}}>
              <div style={{fontWeight:600}}>{lightbox.caption || 'No caption'}</div>
              <div style={{fontSize:'.8rem', color:'rgba(255,255,255,.6)', marginTop:4}}>
                {lightbox.category} · By {lightbox.uploadedBy?.name}
              </div>
            </div>
            <button onClick={() => setLightbox(null)} style={{position:'absolute', top:12, right:12, background:'rgba(0,0,0,.6)', border:'none', color:'#fff', width:36, height:36, borderRadius:'50%', cursor:'pointer', fontSize:'1.2rem'}}>×</button>
          </div>
        </div>
      )}
    </div>
  );
}
