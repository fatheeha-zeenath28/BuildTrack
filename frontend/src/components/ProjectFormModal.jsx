import { useState } from 'react';
import api from '../api';
import toast from 'react-hot-toast';

/**
 * Full Create/Edit Project form in one place, so both the Projects list
 * ("+ New Project") and the Project detail page ("✏️ Edit Project") open
 * the exact same, fully-featured form instead of only being able to tweak
 * the progress slider after creation.
 *
 * - `project` omitted/null  -> Create mode (POST /projects)
 * - `project` provided      -> Edit mode (PUT /projects/:id), fields pre-filled
 *
 * `users` is only passed in (and the engineer/client assignment fields only
 * shown) when the current user is an admin, because GET /api/users is
 * admin-only server-side — an engineer editing a project they're assigned
 * to can still update everything else (title, dates, budget, status...).
 */
export default function ProjectFormModal({ project, onClose, onSaved, users = [], canAssignUsers = false }) {
  const isEdit = Boolean(project);

  const [form, setForm] = useState({
    title: project?.title || '',
    description: project?.description || '',
    location: project?.location || '',
    status: project?.status || 'planning',
    startDate: project?.startDate || '',
    endDate: project?.endDate || '',
    budget: project?.budget ?? '',
    engineers: project?.engineers?.map(u => u._id) || [],
    clients: project?.clients?.map(u => u._id) || [],
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState([]);

  const engineers = users.filter(u => u.role === 'engineer');
  const clients = users.filter(u => u.role === 'client');

  const save = async e => {
    e.preventDefault();
    setErrors([]);

    // A couple of checks mirrored client-side from the server's validation
    // (middleware/validate.js on the Node version, *Service on the Spring
    // Boot version) so the person gets instant feedback instead of a
    // round-trip just to find out the end date is before the start date.
    const clientErrors = [];
    if (!form.title.trim()) clientErrors.push('Project title is required');
    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      clientErrors.push('End date cannot be before start date');
    }
    if (form.budget !== '' && Number(form.budget) < 0) {
      clientErrors.push('Budget cannot be negative');
    }
    if (clientErrors.length) {
      setErrors(clientErrors);
      return;
    }

    setSaving(true);
    try {
      if (isEdit) {
        await api.put(`/projects/${project._id}`, form);
        toast.success('Project updated!');
      } else {
        await api.post('/projects', form);
        toast.success('Project created!');
      }
      onSaved();
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors?.length) {
        setErrors(data.errors);
      } else {
        toast.error(data?.message || (isEdit ? 'Failed to update project' : 'Failed to create project'));
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">{isEdit ? 'Edit Project' : 'New Project'}</span>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {errors.length > 0 && (
            <div className="alert alert-danger mb-4" role="alert">
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {errors.map((msg, i) => <li key={i}>{msg}</li>)}
              </ul>
            </div>
          )}
          <form onSubmit={save}>
            <div className="form-group">
              <label className="form-label">Project Title *</label>
              <input className="form-input" required value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Highway Bridge Project" />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Project overview…" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Location</label>
                <input className="form-input" value={form.location}
                  onChange={e => setForm({ ...form, location: e.target.value })}
                  placeholder="City, Country" />
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value })}>
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="on_hold">On Hold</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Start Date</label>
                <input className="form-input" type="date" value={form.startDate || ''}
                  onChange={e => setForm({ ...form, startDate: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">End Date</label>
                <input className="form-input" type="date" value={form.endDate || ''}
                  min={form.startDate || undefined}
                  onChange={e => setForm({ ...form, endDate: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Budget ($)</label>
              <input className="form-input" type="number" min="0" step="0.01" value={form.budget}
                onChange={e => setForm({ ...form, budget: e.target.value })} placeholder="0" />
            </div>

            {canAssignUsers && (
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Assign Engineers</label>
                  <select className="form-select" multiple value={form.engineers}
                    onChange={e => setForm({ ...form, engineers: [...e.target.selectedOptions].map(o => o.value) })}>
                    {engineers.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Assign Clients</label>
                  <select className="form-select" multiple value={form.clients}
                    onChange={e => setForm({ ...form, clients: [...e.target.selectedOptions].map(o => o.value) })}>
                    {clients.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                  </select>
                </div>
              </div>
            )}

            <div className="flex gap-2 mt-4" style={{ justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving…' : (isEdit ? 'Save Changes' : 'Create Project')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
