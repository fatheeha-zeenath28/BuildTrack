
import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Reports() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const load = async () => {
    try {
      const [rRes, pRes] = await Promise.all([
        api.get('/reports'),
        api.get('/projects')
      ]);

      setReports(rRes.data.reports || []);
      setProjects(pRes.data.projects || []);
    } catch (error) {
      console.error('Failed to load reports:', error);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const del = async (reportId) => {
    if (!reportId) {
      toast.error('Report ID is missing');
      return;
    }

    if (!confirm('Delete report?')) return;

    try {
      console.log('Deleting report ID:', reportId);

      await api.delete(`/reports/${encodeURIComponent(reportId)}`);

      toast.success('Report deleted successfully');
      await load();
    } catch (error) {
      console.error('Report deletion failed:', {
        reportId,
        status: error.response?.status,
        response: error.response?.data
      });

      toast.error(
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Failed to delete report. Check the browser console.'
      );
    }
  };

  const filtered =
    filter === 'all'
      ? reports
      : reports.filter(
          (r) => String(r.project?.id ?? r.project?._id ?? r.project) === String(filter)
        );

  if (loading) {
    return (
      <div className="loading-center">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Site Reports</div>
          <div className="page-sub">
            {reports.length} reports submitted
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-4" style={{ flexWrap: 'wrap' }}>
        <button
          className={`btn btn-sm ${
            filter === 'all' ? 'btn-primary' : 'btn-secondary'
          }`}
          onClick={() => setFilter('all')}
        >
          All Projects
        </button>

        {projects.map((p) => {
          const projectId = p._id ?? p.id;

          return (
            <button
              key={projectId}
              className={`btn btn-sm ${
                String(filter) === String(projectId)
                  ? 'btn-primary'
                  : 'btn-secondary'
              }`}
              onClick={() => setFilter(String(projectId))}
            >
              {(p.title || 'Untitled project').slice(0, 20)}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <p>No reports found</p>
        </div>
      ) : (
        filtered.map((r) => (
          <div key={r.id ?? r._id} className="card mb-4">
            <div className="card-header">
              <div>
                <span className="card-title">{r.title}</span>

                <div
                  style={{
                    marginTop: 6,
                    display: 'flex',
                    gap: 12,
                    flexWrap: 'wrap',
                    fontSize: '.78rem',
                    color: 'var(--muted)'
                  }}
                >
                  <span>📁 {r.project?.title || 'Unknown project'}</span>
                  <span>👤 {r.author?.name || 'Unknown author'}</span>
                  <span>
                    📅{' '}
                    {r.reportDate
                      ? new Date(r.reportDate).toLocaleDateString()
                      : 'No date'}
                  </span>
                  {r.weather && <span>🌤 {r.weather}</span>}
                  {r.workers > 0 && <span>👷 {r.workers} workers</span>}
                </div>
              </div>

              {user?.role === 'admin' && (
                <button
                  className="btn-icon"
                  onClick={() => del(r.id ?? r._id)}
                  style={{ color: 'var(--danger)' }}
                  title="Delete report"
                >
                  🗑️
                </button>
              )}
            </div>

            <div className="card-body" style={{ paddingTop: 12 }}>
              <p style={{ fontSize: '.875rem', lineHeight: 1.8 }}>
                {r.content}
              </p>

              {r.issues?.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: '.8rem',
                      color: 'var(--muted)',
                      marginBottom: 8
                    }}
                  >
                    REPORTED ISSUES
                  </div>

                  {r.issues.map((issue, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '8px 12px',
                        background: '#fff1f2',
                        borderRadius: 8,
                        marginBottom: 6
                      }}
                    >
                      <span>⚠️</span>
                      <span style={{ fontSize: '.875rem' }}>
                        {issue.description}
                      </span>
                      <span
                        className={`badge ${
                          issue.severity === 'high'
                            ? 'badge-danger'
                            : issue.severity === 'medium'
                              ? 'badge-warning'
                              : 'badge-gray'
                        }`}
                      >
                        {issue.severity}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
