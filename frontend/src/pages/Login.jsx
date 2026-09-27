import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handle = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>Build<span>Track</span></h1>
          <p>Construction Project Monitoring</p>
        </div>
        <form onSubmit={handle}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" required placeholder="you@example.com"
              value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" required placeholder="••••••••"
              value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
          </div>
          <button className="btn btn-primary w-full" style={{justifyContent:'center', marginTop:8}} disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
        <div className="auth-footer">
          Don't have an account? <Link to="/register" style={{color:'var(--primary)',fontWeight:600}}>Register</Link>
        </div>
        <div style={{marginTop:20, padding:16, background:'#f8fafc', borderRadius:10, fontSize:'.78rem', color:'#64748b'}}>
          <strong>Demo accounts:</strong><br/>
          admin@buildtrack.com / admin123<br/>
          engineer@buildtrack.com / eng123<br/>
          client@buildtrack.com / client123
        </div>
      </div>
    </div>
  );
}
