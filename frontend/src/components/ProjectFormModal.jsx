
import { useState, useEffect } from 'react';
import api from '../api';
import toast from 'react-hot-toast';

export default function ProjectFormModal({
  project,
  users = [],
  canAssignUsers = false,
  onClose,
  onSaved,
}) {
  const isEdit = Boolean(project);
  const projectId = project?.id || project?._id;

  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    status: 'planning',
    startDate: '',
    endDate: '',
    budget: 0,
    engineers: [],
    clients: [],
  });

  const [errors, setErrors] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!project) return;

    setForm({
      title: project.title || '',
      description: project.description || '',
      location: project.location || '',
      status: project.status || 'planning',
      startDate: project.startDate || '',
      endDate: project.endDate || '',
      budget: project.budget ?? 0,
      engineers: (project.engineers || []).map((u) =>
        typeof u === 'object' ? (u.id || u._id) : u
      ),
      clients: (project.clients || []).map((u) =>
        typeof u === 'object' ? (u.id || u._id) : u
      ),
    });
  }, [project]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSelection = (e) => {
    const { name, options } = e.target;
    const selected = Array.from(options)
      .filter((option) => option.selected)
      .map((option) => option.value);

    setForm((previous) => ({
      ...previous,
      [name]: selected,
    }));
  };

  const validate = () => {
    const messages = [];

    if (!form.title.trim()) {
      messages.push('Project title is required.');
    }

    if (
      form.startDate &&
      form.endDate &&
      form.endDate < form.startDate
    ) {
      messages.push('End date cannot be before the start date.');
    }

    if (form.budget !== '' && Number(form.budget) < 0) {
      messages.push('Budget cannot be negative.');
    }

    if (isEdit && !projectId) {
      messages.push(
        'Project ID is missing. Close the form and reopen the project.'
      );
    }

    setErrors(messages);
    return messages.length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setSaving(true);

    const payload = {
      ...form,
      title: form.title.trim(),
      budget: Number(form.budget || 0),
    };

    try {
      if (isEdit) {
        await api.put(
          `/projects/${encodeURIComponent(projectId)}`,
          payload
        );
        toast.success('Project updated successfully');
      } else {
        await api.post('/projects', payload);
        toast.success('Project created successfully');
      }

      onSaved();
    } catch (err) {
      const data = err.response?.data;

      if (Array.isArray(data?.errors)) {
        setErrors(data.errors);
      } else {
        const message =
          data?.message ||
          data?.error ||
          (isEdit
            ? 'Failed to update project'
            : 'Failed to create project');

        setErrors([message]);
        toast.error(message);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="modal-title">
            {isEdit ? 'Edit Project' : 'New Project'}
          </h2>

          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            {errors.length > 0 && (
              <div className="alert alert-danger mb-4">
                {errors.map((error, index) => (
                  <div key={`${error}-${index}`}>• {error}</div>
                ))}
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="title">
                Project Title *
              </label>
              <input
                className="form-input"
                id="title"
                name="title"
                value={form.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="description">
                Description
              </label>
              <textarea
                className="form-textarea"
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="location">
                  Location
                </label>
                <input
                  className="form-input"
                  id="location"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="status">
                  Status
                </label>
                <select
                  className="form-select"
                  id="status"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="on_hold">On hold</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="startDate">
                  Start Date
                </label>
                <input
                  className="form-input"
                  id="startDate"
                  type="date"
                  name="startDate"
                  value={form.startDate}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="endDate">
                  End Date
                </label>
                <input
                  className="form-input"
                  id="endDate"
                  type="date"
                  name="endDate"
                  value={form.endDate}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="budget">
                Budget
              </label>
              <input
                className="form-input"
                id="budget"
                type="number"
                name="budget"
                min="0"
                step="any"
                value={form.budget}
                onChange={handleChange}
              />
            </div>

            {canAssignUsers && (
              <>
                <div className="form-group">
                  <label className="form-label" htmlFor="engineers">
                    Engineers
                  </label>
                  <select
                    className="form-select"
                    id="engineers"
                    name="engineers"
                    multiple
                    value={form.engineers}
                    onChange={handleSelection}
                  >
                    {users
                      .filter((u) => u.role === 'engineer')
                      .map((u) => (
                        <option
                          key={u.id || u._id}
                          value={u.id || u._id}
                        >
                          {u.name || u.email}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="clients">
                    Clients
                  </label>
                  <select
                    className="form-select"
                    id="clients"
                    name="clients"
                    multiple
                    value={form.clients}
                    onChange={handleSelection}
                  >
                    {users
                      .filter((u) => u.role === 'client')
                      .map((u) => (
                        <option
                          key={u.id || u._id}
                          value={u.id || u._id}
                        >
                          {u.name || u.email}
                        </option>
                      ))}
                  </select>
                </div>
              </>
            )}

            <div className="flex justify-between gap-2">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving
                  ? 'Saving...'
                  : isEdit
                    ? 'Save Changes'
                    : 'Create Project'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

