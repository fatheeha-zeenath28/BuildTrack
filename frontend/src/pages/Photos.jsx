
import { useState, useEffect } from 'react';
import api from '../api';
import { fileUrl } from '../config';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Photos() {
  const { user } = useAuth();
  const [photos, setPhotos] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [lightbox, setLightbox] = useState(null);

  const load = async () => {
    try {
      const [phRes, pRes] = await Promise.all([
        api.get('/photos'),
        api.get('/projects'),
      ]);
      setPhotos(phRes.data.photos);
      setProjects(pRes.data.projects);
      console.log('Photo page projects:', pRes.data.projects);
    } catch (error) {
      console.error('Failed to load photos:', error);
      toast.error('Failed to load photos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const del = async (id) => {
    if (!window.confirm('Delete photo?')) return;

    try {
      await api.delete(`/photos/${id}`);
      toast.success('Deleted');
      if (lightbox?._id === id) setLightbox(null);
      await load();
    } catch (error) {
      console.error('Failed to delete photo:', error);
      toast.error('Failed to delete photo');
    }
  };

  const filtered =
    filter === 'all'
      ? photos
      : photos.filter(
          (p) => p.project?._id === filter || p.category === filter
        );

  if (loading) {
    return (
      <div className="loading-center">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="photos-background">
      <div className="photos-content">
        <div className="page-header">
          <div>
            <div className="page-title">Site Photos</div>
            <div className="page-sub">
              {photos.length} photos uploaded
            </div>
          </div>

          <div className="photos-count">
            <span>📸</span>
            <div>
              <strong>{filtered.length}</strong>
              <span> photos displayed</span>
            </div>
          </div>
        </div>

        <div className="photos-filters">

          <button
            key = "all-photos"
            className={`btn btn-sm ${
              filter === 'all' ? 'btn-primary' : 'btn-secondary'
            }`}
            onClick={() => setFilter('all')}
          >
            All Photos
          </button>

          {['progress', 'issue', 'completion', 'other'].map((c) => (
             <button
              key={c}
              className={`btn btn-sm ${
                filter === c ? 'btn-primary' : 'btn-secondary'
              }`}
              onClick={() => setFilter(c)}
            >
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </button>
            ))}

          {projects.map((p) => (
            <button
              key={p._id}
              className={`btn btn-sm ${
                filter === p._id ? 'btn-primary' : 'btn-secondary'
              }`}
              onClick={() => setFilter(p._id)}
            >
              📁 {(p.title || 'Untitled project').slice(0, 16)}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state photos-empty">
            <div className="empty-icon">📷</div>
            <p>No photos found</p>
            <span>Try another category or project filter.</span>
          </div>
        ) : (
          <div className="photos-grid">
            {filtered.map((p) => (
              <article key={p._id} className="photo-glass-card">
                <div
                  className="photo-image-wrap"
                  onClick={() => setLightbox(p)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setLightbox(p);
                    }
                  }}
                  aria-label={`View photo: ${p.caption || 'No caption'}`}
                >
                  <img
                    src={fileUrl(p.url)}
                    alt={p.caption || 'Construction site photo'}
                    className="photo-thumbnail"
                    onError={(e) => {
                      e.currentTarget.style.visibility = 'hidden';
                    }}
                  />

                  <span
                    className={`badge ${
                      p.category === 'issue'
                        ? 'badge-danger'
                        : p.category === 'completion'
                          ? 'badge-success'
                          : 'badge-info'
                    } photo-category`}
                  >
                    {p.category}
                  </span>

                  <span className="photo-view-hint">View photo ↗</span>
                </div>

                <div className="photo-details">
                  <div className="photo-caption">
                    {p.caption || 'No caption'}
                  </div>

                  <div className="photo-meta">
                    <span>
                      By {p.uploadedBy?.name || 'Unknown user'}
                    </span>
                    <span className="photo-project">
                      {p.project?.title || 'Unknown project'}
                    </span>
                  </div>

                  {(user.role === 'admin' ||
                    user.role === 'engineer') && (
                    <div className="photo-actions">
                      <button
                        className="btn-icon"
                        onClick={() => del(p._id)}
                        style={{ color: 'var(--danger)' }}
                        title="Delete photo"
                        aria-label="Delete photo"
                      >
                        🗑️
                      </button>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {lightbox && (
        <div
          className="modal-overlay photo-lightbox"
          onClick={() => setLightbox(null)}
        >
          <div
            className="photo-lightbox-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={fileUrl(lightbox.url)}
              alt={lightbox.caption || 'Construction site photo'}
              className="photo-lightbox-image"
            />

            <div className="photo-lightbox-info">
              <div className="photo-lightbox-caption">
                {lightbox.caption || 'No caption'}
              </div>
              <div className="photo-lightbox-meta">
                {lightbox.category} · By{' '}
                {lightbox.uploadedBy?.name || 'Unknown user'}
              </div>
            </div>

            <button
              onClick={() => setLightbox(null)}
              className="photo-lightbox-close"
              aria-label="Close photo"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
