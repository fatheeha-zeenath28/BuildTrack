import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  // NOTE: there is intentionally no "role" field here. Public registration
  // always creates a Client account — the backend enforces this too, even
  // if this form is bypassed. Admins can promote a user to Engineer/Admin
  // later from Admin → User Management.
  const [form, setForm]       = useState({ name:'', email:'', password:'' });
  const [loading, setLoading] = useState(false);

  const handle = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>Build<span>Track</span></h1>
          <p>Create your account</p>
        </div>
        <form onSubmit={handle}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" required placeholder="John Doe"
              value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" required placeholder="you@example.com"
              value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" required placeholder="Min. 6 characters"
              value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
          </div>
          <p style={{fontSize:'.8rem', color:'var(--muted)', margin:'-4px 0 8px'}}>
            New accounts are created as <strong>Client</strong>. An administrator can upgrade your
            account to Site Engineer or Admin from User Management if needed.
          </p>
          <button className="btn btn-primary w-full" style={{justifyContent:'center', marginTop:8}} disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>
        <div className="auth-footer">
          Already have an account? <Link to="/login" style={{color:'var(--primary)',fontWeight:600}}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}
