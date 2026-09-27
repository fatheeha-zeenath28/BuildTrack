// Small, dependency-free request validators.
//
// The project previously passed `req.body` straight into Mongoose
// (e.g. `Project.create({ ...req.body })`), which means bad input (a
// missing title, a negative budget, an out-of-range progress value, a
// garbage date, an unrecognised status) only failed late, with a raw
// Mongoose error message, or in some cases not at all.
//
// These middlewares run BEFORE the controller and return a clean 400
// with a list of problems when the input is invalid, and otherwise call
// next(). They intentionally don't require any new npm package.

const PROJECT_STATUSES = ['planning', 'active', 'on_hold', 'completed'];
const TASK_STATUSES    = ['pending', 'in_progress', 'completed', 'blocked'];
const TASK_PRIORITIES  = ['low', 'medium', 'high', 'critical'];
const USER_ROLES       = ['admin', 'engineer', 'client'];

const isNonEmptyString = (v) => typeof v === 'string' && v.trim().length > 0;
const isFiniteNumber   = (v) => typeof v === 'number' && Number.isFinite(v);
const isValidDate      = (v) => v !== undefined && v !== null && v !== '' && !Number.isNaN(new Date(v).getTime());

function respondIfErrors(res, errors) {
  if (errors.length > 0) {
    res.status(400).json({ message: 'Validation failed', errors });
    return true;
  }
  return false;
}

// ---- Auth --------------------------------------------------------------

exports.validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = [];

  if (!isNonEmptyString(name)) errors.push('name is required');
  if (!isNonEmptyString(email) || !/^\S+@\S+\.\S+$/.test(email)) errors.push('a valid email is required');
  if (!isNonEmptyString(password) || password.length < 6) errors.push('password must be at least 6 characters');

  if (respondIfErrors(res, errors)) return;
  next();
};

// ---- Project ------------------------------------------------------------

exports.validateProject = (req, res, next) => {
  const { title, budget, progress, status, startDate, endDate } = req.body;
  const isCreate = req.method === 'POST';
  const errors = [];

  // title: required on create, and if present on update, must not be blank
  if (isCreate && !isNonEmptyString(title)) errors.push('title is required');
  if (!isCreate && title !== undefined && !isNonEmptyString(title)) errors.push('title cannot be empty');

  if (budget !== undefined) {
    if (!isFiniteNumber(Number(budget)) || Number(budget) < 0) errors.push('budget must be a non-negative number');
    else req.body.budget = Number(budget);
  }

  if (progress !== undefined) {
    const p = Number(progress);
    if (!isFiniteNumber(p) || p < 0 || p > 100) errors.push('progress must be a number between 0 and 100');
    else req.body.progress = p;
  }

  if (status !== undefined && !PROJECT_STATUSES.includes(status)) {
    errors.push(`status must be one of: ${PROJECT_STATUSES.join(', ')}`);
  }

  if (startDate !== undefined && startDate !== '' && !isValidDate(startDate)) errors.push('startDate must be a valid date');
  if (endDate !== undefined && endDate !== '' && !isValidDate(endDate)) errors.push('endDate must be a valid date');
  if (isValidDate(startDate) && isValidDate(endDate) && new Date(endDate) < new Date(startDate)) {
    errors.push('endDate cannot be before startDate');
  }

  // Never let a client pick who the project admin is via the body.
  delete req.body.admin;

  if (respondIfErrors(res, errors)) return;
  next();
};

// ---- Task ---------------------------------------------------------------

exports.validateTask = (req, res, next) => {
  const { title, project, status, priority, dueDate } = req.body;
  const isCreate = req.method === 'POST';
  const errors = [];

  if (isCreate && !isNonEmptyString(title)) errors.push('title is required');
  if (isCreate && !isNonEmptyString(project)) errors.push('project is required');

  if (status !== undefined && !TASK_STATUSES.includes(status)) {
    errors.push(`status must be one of: ${TASK_STATUSES.join(', ')}`);
  }
  if (priority !== undefined && !TASK_PRIORITIES.includes(priority)) {
    errors.push(`priority must be one of: ${TASK_PRIORITIES.join(', ')}`);
  }
  if (dueDate !== undefined && dueDate !== '' && !isValidDate(dueDate)) errors.push('dueDate must be a valid date');

  if (respondIfErrors(res, errors)) return;
  next();
};

// ---- Report ---------------------------------------------------------------

exports.validateReport = (req, res, next) => {
  const { project, title, content, workers, reportDate } = req.body;
  const errors = [];

  if (!isNonEmptyString(project)) errors.push('project is required');
  if (!isNonEmptyString(title)) errors.push('title is required');
  if (!isNonEmptyString(content)) errors.push('content is required');
  if (workers !== undefined) {
    const w = Number(workers);
    if (!isFiniteNumber(w) || w < 0) errors.push('workers must be a non-negative number');
    else req.body.workers = w;
  }
  if (reportDate !== undefined && reportDate !== '' && !isValidDate(reportDate)) errors.push('reportDate must be a valid date');

  if (respondIfErrors(res, errors)) return;
  next();
};

// ---- User (admin editing a user) ------------------------------------------

exports.validateUserUpdate = (req, res, next) => {
  const { role, email, name } = req.body;
  const errors = [];

  if (role !== undefined && !USER_ROLES.includes(role)) errors.push(`role must be one of: ${USER_ROLES.join(', ')}`);
  if (email !== undefined && (!isNonEmptyString(email) || !/^\S+@\S+\.\S+$/.test(email))) errors.push('email must be valid');
  if (name !== undefined && !isNonEmptyString(name)) errors.push('name cannot be empty');

  // A user's password must never be changed through this generic endpoint.
  delete req.body.password;

  if (respondIfErrors(res, errors)) return;
  next();
};
