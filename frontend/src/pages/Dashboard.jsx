import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const COLORS = ['#f97316','#0ea5e9','#22c55e','#eab308'];

function StatCard({ icon, label, value, bg }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: bg }}>{icon}</div>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats]       = useState(null);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks]       = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [pRes, tRes] = await Promise.all([
          api.get('/projects'),
          api.get('/tasks'),
        ]);
        setProjects(pRes.data.projects);
        setTasks(tRes.data.tasks);

        if (user.role === 'admin') {
          const sRes = await api.get('/projects/stats');
          setStats(sRes.data);
        }
      } catch(e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, [user]);

  if (loading) return <div className="loading-center"><div className="spinner"/></div>;

  const recent = [...projects].slice(0,5);
  const statusCounts = ['planning','active','on_hold','completed'].map(s => ({
    name: s.replace('_',' '), value: projects.filter(p => p.status === s).length
  }));
  const barData = recent.map(p => ({ name: p.title.slice(0,15), progress: p.progress }));

  const pendingTasks    = tasks.filter(t => t.status === 'pending').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const completedTasks  = tasks.filter(t => t.status === 'completed').length;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">👋 Welcome back, {user.name.split(' ')[0]}!</div>
          <div className="page-sub">Here's what's happening on your projects today.</div>
        </div>
      </div>

      <div className="grid-4 mb-4">
        <StatCard icon="🏗️" label="Total Projects"    value={projects.length}    bg="#fff7ed"/>
        <StatCard icon="⚡" label="Active Projects"   value={projects.filter(p=>p.status==='active').length} bg="#eff6ff"/>
        <StatCard icon="✅" label="Completed"          value={projects.filter(p=>p.status==='completed').length} bg="#f0fdf4"/>
        <StatCard icon="📋" label="Total Tasks"        value={tasks.length}       bg="#fefce8"/>
      </div>

      <div className="grid-2 mb-4">
        <div className="card">
          <div className="card-header"><span className="card-title">Project Progress</span></div>
          <div className="card-body">
            {barData.length === 0
              ? <div className="empty-state"><div className="empty-icon">📊</div><p>No projects yet</p></div>
              : <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={barData} margin={{top:5,right:10,left:-10,bottom:5}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                    <XAxis dataKey="name" tick={{fontSize:11}} />
                    <YAxis domain={[0,100]} tick={{fontSize:11}} />
                    <Tooltip formatter={v => `${v}%`} />
                    <Bar dataKey="progress" fill="#f97316" radius={[6,6,0,0]} />
                  </BarChart>
                </ResponsiveContainer>}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">Projects by Status</span></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusCounts} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
                  {statusCounts.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" iconSize={10} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Projects</span>
            <button className="btn btn-sm btn-secondary" onClick={() => navigate('/projects')}>View all</button>
          </div>
          <div className="card-body">
            {recent.length === 0
              ? <div className="empty-state"><div className="empty-icon">🏗️</div><p>No projects yet</p></div>
              : recent.map(p => (
                <div key={p._id} style={{marginBottom:14, cursor:'pointer'}} onClick={() => navigate(`/projects/${p._id}`)}>
                  <div className="flex items-center justify-between" style={{marginBottom:6}}>
                    <span style={{fontWeight:600, fontSize:'.875rem'}}>{p.title}</span>
                    <StatusBadge s={p.status}/>
                  </div>
                  <div className="progress-bar"><div className="progress-fill" style={{width:`${p.progress}%`}}/></div>
                  <div style={{fontSize:'.75rem', color:'var(--muted)', marginTop:4}}>{p.progress}% complete</div>
                </div>
              ))
            }
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Task Summary</span>
            {user.role !== 'client' && <button className="btn btn-sm btn-secondary" onClick={() => navigate('/tasks')}>View all</button>}
          </div>
          <div className="card-body">
            {[['⏳','Pending',pendingTasks,'#fff7ed','#f97316'],
              ['🔄','In Progress',inProgressTasks,'#eff6ff','#0ea5e9'],
              ['✅','Completed',completedTasks,'#f0fdf4','#22c55e']].map(([icon,label,val,bg,col]) => (
              <div key={label} className="flex items-center justify-between" style={{padding:'12px 0', borderBottom:'1px solid var(--border)'}}>
                <div className="flex items-center gap-2">
                  <div style={{width:36,height:36,borderRadius:10,background:bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.1rem'}}>{icon}</div>
                  <span style={{fontWeight:600, fontSize:'.875rem'}}>{label}</span>
                </div>
                <span style={{fontWeight:700, fontSize:'1.1rem', color:col}}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ s }) {
  const map = { planning:'badge-info', active:'badge-success', on_hold:'badge-warning', completed:'badge-gray' };
  return <span className={`badge ${map[s]||'badge-gray'}`}>{s?.replace('_',' ')}</span>;
}
