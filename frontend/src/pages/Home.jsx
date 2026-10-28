
import { Link } from 'react-router-dom';

const features = [
  {
    icon: '🏗️',
    title: 'Project Management',
    description:
      'Keep project information organised and monitor progress from one central workspace.',
  },
  {
    icon: '✓',
    title: 'Task Tracking',
    description:
      'Assign, review and track construction tasks so teams can stay aligned.',
  },
  {
    icon: '▤',
    title: 'Reports & Insights',
    description:
      'Review site reports and keep important project updates accessible.',
  },
  {
    icon: '▧',
    title: 'Site Photos',
    description:
      'Organise construction photos to maintain a visual record of project activity.',
  },
];

export default function Home() {
  return (
    <main className="home-page">
      <header className="home-header">
        <Link to="/" className="home-brand" aria-label="BuildTrack home">
          <span className="home-brand-icon">B</span>
          <span>
            Build<span className="home-brand-accent">Track</span>
            <small>CONSTRUCTION MANAGEMENT</small>
          </span>
        </Link>

        <nav className="home-nav" aria-label="Main navigation">
          <a href="#features">Features</a>
          <a href="#about">About</a>
          <Link className="home-login-link" to="/login">
            Log in
          </Link>
          <Link className="home-nav-cta" to="/login">
            Get Started <span aria-hidden="true">→</span>
          </Link>
        </nav>
      </header>

      <section className="home-hero">
        <div className="home-hero-overlay" />

        <div className="home-hero-content">
          <p className="home-eyebrow">
            BUILT FOR BETTER PROJECT DELIVERY
          </p>

          <h1>
            Build with confidence.
            <br />
            <span>Manage with clarity.</span>
          </h1>

          <p className="home-hero-description">
            Bring your construction projects, tasks, reports and site
            updates together in one organised workspace.
          </p>

          <div className="home-hero-actions">
            <Link className="home-primary-button" to="/login">
              Access BuildTrack <span aria-hidden="true">→</span>
            </Link>

            <a className="home-secondary-button" href="#features">
              Explore Features
            </a>
          </div>

          <div className="home-hero-note">
            <span className="home-status-dot" />
            One workspace. Better project visibility.
          </div>
        </div>

        <div className="home-hero-label">
          CONSTRUCTION · COORDINATION · PROGRESS
        </div>
      </section>

      <section className="home-intro" id="about">
        <div>
          <p className="home-section-label">INTRODUCING BUILDTRACK</p>
          <h2>
            Every project detail,
            <br />
            in one place.
          </h2>
        </div>

        <p className="home-intro-description">
          Construction work involves people, schedules, tasks and
          constant updates. BuildTrack provides a central place to
          organise project information and make day-to-day monitoring
          easier for your team.
        </p>
      </section>

      <section className="home-features" id="features">
        <div className="home-section-heading">
          <div>
            <p className="home-section-label">THE BUILDTRACK WORKSPACE</p>
            <h2>Everything your projects need.</h2>
          </div>

          <Link to="/login" className="home-text-link">
            Enter workspace <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="home-feature-grid">
          {features.map((feature, index) => (
            <article className="home-feature-card" key={feature.title}>
              <div className="home-feature-top">
                <span className="home-feature-icon">{feature.icon}</span>
                <span className="home-feature-number">
                  0{index + 1}
                </span>
              </div>

              <h3>{feature.title}</h3>
              <p>{feature.description}</p>

              <Link to="/login" className="home-feature-link">
                Explore <span aria-hidden="true">↗</span>
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="home-cta">
        <div>
          <p className="home-section-label">YOUR PROJECTS. YOUR TEAM.</p>
          <h2>Make every project easier to manage.</h2>
          <p>
            Sign in to access your projects, tasks, reports and site photos.
          </p>
        </div>

        <Link to="/login" className="home-primary-button">
          Go to BuildTrack <span aria-hidden="true">→</span>
        </Link>
      </section>

      <footer className="home-footer">
        <Link to="/" className="home-footer-brand">
          Build<span>Track</span>
        </Link>

        <p>Construction project management, made more organised.</p>

        <div className="home-footer-links">
          <a href="#about">About</a>
          <a href="#features">Features</a>
          <Link to="/login">Log in</Link>
        </div>

        <div className="home-footer-bottom">
          <span>© {new Date().getFullYear()} BuildTrack</span>
          <span>Built for better project coordination.</span>
        </div>
      </footer>
    </main>
  );
}
