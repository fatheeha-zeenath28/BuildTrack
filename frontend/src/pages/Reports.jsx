
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
        api.get('/projects'),
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

    if (!window.confirm('Delete report?')) return;

    try {
      await api.delete(`/reports/${encodeURIComponent(reportId)}`);
      toast.success('Report deleted successfully');
      await load();
    } catch (error) {
      console.error('Report deletion failed:', {
        reportId,
        status: error.response?.status,
        response: error.response?.data,
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
          (r) =>
            String(r.project?.id ?? r.project?._id ?? r.project) ===
            String(filter)
        );

  if (loading) {
    return (
      <div className="loading-center">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="reports-background">
      <div className="reports-content">
        <div className="page-header">
          <div>
            <div className="page-title">Site Reports</div>
            <div className="page-sub">
              {reports.length} reports submitted
            </div>
          </div>
          <div className="reports-count">
            <span>📋</span>
            <div>
              <strong>{filtered.length}</strong>
              <span> displayed</span>
            </div>
          </div>
        </div>

        <div className="reports-filters">
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
          <div className="empty-state reports-empty">
            <div className="empty-icon">📋</div>
            <p>No reports found</p>
            <span>Try selecting another project filter.</span>
          </div>
        ) : (
          <div className="reports-list">
            {filtered.map((r) => (
              <article
                key={r.id ?? r._id}
                className="card report-glass-card"
              >
                <div className="card-header report-card-header">
                  <div className="report-heading">
                    <span className="report-icon">📑</span>
                    <div>
                      <span className="card-title">{r.title}</span>

                      <div className="report-meta">
                        <span>
                          📁 {r.project?.title || 'Unknown project'}
                        </span>
                        <span>
                          👤 {r.author?.name || 'Unknown author'}
                        </span>
                        <span>
                          📅{' '}
                          {r.reportDate
                            ? new Date(r.reportDate).toLocaleDateString()
                            : 'No date'}
                        </span>
                        {r.weather && <span>🌤 {r.weather}</span>}
                        {r.workers > 0 && (
                          <span>👷 {r.workers} workers</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {user?.role === 'admin' && (
                    <button
                      className="btn-icon"
                      onClick={() => del(r.id ?? r._id)}
                      style={{ color: 'var(--danger)' }}
                      title="Delete report"
                      aria-label={`Delete report ${r.title}`}
                    >
                      🗑️
                    </button>
                  )}
                </div>

                <div className="card-body report-card-body">
                  <div className="report-section-label">REPORT DETAILS</div>
                  <p className="report-description">
                    {r.content || 'No report details provided.'}
                  </p>

                  {r.issues?.length > 0 && (
                    <div className="report-issues">
                      <div className="report-section-label">
                        ⚠️ REPORTED ISSUES ({r.issues.length})
                      </div>

                      {r.issues.map((issue, i) => (
                        <div className="report-issue" key={i}>
                          <span className="report-issue-icon">⚠️</span>
                          <span className="report-issue-description">
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
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
