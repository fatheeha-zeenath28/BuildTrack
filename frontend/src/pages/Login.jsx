import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bt-login">
      <section className="bt-login-visual">
        <Link to="/" className="bt-login-brand">
          <span className="bt-login-brand-icon">B</span>
          <span>
            Build<span>Track</span>
            <small>CONSTRUCTION MANAGEMENT</small>
          </span>
        </Link>

        <div className="bt-login-message">
          <span className="bt-login-eyebrow">
            YOUR PROJECTS. YOUR TEAM.
          </span>

          <h1>
            Build better.
            <br />
            <span>Track smarter.</span>
          </h1>

          <p>
            One organised workspace for construction projects,
            tasks, reports and site updates.
          </p>

          <div className="bt-login-benefits">
            <div>
              <span>✓</span>
              Manage construction projects
            </div>
            <div>
              <span>✓</span>
              Track tasks and progress
            </div>
            <div>
              <span>✓</span>
              Keep project updates organised
            </div>
          </div>
        </div>

        <p className="bt-login-visual-footer">
          CONSTRUCTION · COORDINATION · PROGRESS
        </p>
      </section>

      <section className="bt-login-panel">
        <div className="bt-login-panel-top">
          <Link to="/" className="bt-login-back">
            ← Back to homepage
          </Link>
          <span className="bt-login-secure">Secure sign in</span>
        </div>

        <div className="bt-login-form-wrap">
          <div className="bt-login-heading">
            <span className="bt-login-small-label">WELCOME BACK</span>
            <h2>Sign in to BuildTrack</h2>
            <p>
              Enter your account details to access your workspace.
            </p>
          </div>

          <form onSubmit={handle} className="bt-login-form">
            <div className="form-group">
              <label
                className="form-label"
                htmlFor="login-email"
              >
                Email address
              </label>

              <input
                id="login-email"
                className="form-input"
                type="email"
                autoComplete="username"
                required
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label
                className="form-label"
                htmlFor="login-password"
              >
                Password
              </label>

              <input
                id="login-password"
                className="form-input"
                type="password"
                autoComplete="current-password"
                required
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
              />
            </div>

            <button
              className="bt-login-submit"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign in to workspace'}
              {!loading && <span aria-hidden="true">→</span>}
            </button>
          </form>

          <div className="bt-login-register">
            Don't have an account?{' '}
            <Link to="/register">Create an account</Link>
          </div>

          <div className="bt-login-demo">
            <strong>Demo accounts</strong>
            <p>Administrator: admin@buildtrack.com</p>
            <p>Engineer: engineer@buildtrack.com</p>
            <p>Client: client@buildtrack.com</p>
            <small>
              Use the existing demo passwords configured for your project.
            </small>
          </div>
        </div>

        <footer className="bt-login-panel-footer">
          <span>© {new Date().getFullYear()} BuildTrack</span>
          <span>Construction project management</span>
        </footer>
      </section>
    </main>
  );
}
