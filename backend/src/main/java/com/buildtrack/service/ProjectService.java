package com.buildtrack.service;

import com.buildtrack.dto.request.ProjectRequest;
import com.buildtrack.dto.response.ProjectResponse;
import com.buildtrack.dto.response.ProjectStatsResponse;
import com.buildtrack.dto.response.UserSummary;
import com.buildtrack.exception.ForbiddenException;
import com.buildtrack.exception.NotFoundException;
import com.buildtrack.exception.ValidationException;
import com.buildtrack.model.Project;
import com.buildtrack.model.User;
import com.buildtrack.repository.ProjectRepository;
import com.buildtrack.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public ProjectService(ProjectRepository projectRepository, UserRepository userRepository) {
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }

    // ---- Reads -------------------------------------------------------

    public List<ProjectResponse> getProjects(User currentUser) {
        List<Project> projects;
        if (User.ROLE_ENGINEER.equals(currentUser.getRole())) {
            projects = projectRepository.findAllByEngineersContainingOrderByCreatedAtDesc(currentUser.getId());
        } else if (User.ROLE_CLIENT.equals(currentUser.getRole())) {
            projects = projectRepository.findAllByClientsContainingOrderByCreatedAtDesc(currentUser.getId());
        } else {
            projects = projectRepository.findAllByOrderByCreatedAtDesc();
        }
        return populateAll(projects);
    }

    public ProjectResponse getProject(String id) {
        Project project = findOrThrow(id);
        return populate(project);
    }

    public ProjectStatsResponse getStats() {
        long total = projectRepository.count();
        long active = projectRepository.countByStatus("active");
        long completed = projectRepository.countByStatus("completed");
        long planning = projectRepository.countByStatus("planning");
        List<Project> all = projectRepository.findAll();
        long avgProgress = Math.round(all.stream().mapToInt(Project::getProgress).average().orElse(0));
        return new ProjectStatsResponse(total, active, completed, planning, avgProgress);
    }

    // ---- Writes --------------------------------------------------------

    public ProjectResponse createProject(ProjectRequest req, User currentUser) {
        Project project = new Project();
        applyValidatedFields(project, req, true);
        project.setAdmin(currentUser.getId());
        Project saved = projectRepository.save(project);
        return populate(saved);
    }

    public ProjectResponse updateProject(String id, ProjectRequest req, User currentUser) {
        Project project = findOrThrow(id);

        // Resource-level authorization: an admin may edit any project, but
        // an engineer may only edit a project they are actually assigned to
        // (see README "Security Architecture" — this is the fix for
        // "Engineer A cannot modify a project that Engineer A is not
        // assigned to", the Java equivalent of resourceAuth.requireAssignedEngineer
        // in the Node backend).
        if (User.ROLE_ENGINEER.equals(currentUser.getRole())
                && !project.getEngineers().contains(currentUser.getId())) {
            throw new ForbiddenException("You are not assigned to this project");
        }

        applyValidatedFields(project, req, false);
        Project saved = projectRepository.save(project);
        return populate(saved);
    }

    public void deleteProject(String id) {
        if (!projectRepository.existsById(id)) throw new NotFoundException("Project not found");
        projectRepository.deleteById(id);
    }

    // ---- Helpers ---------------------------------------------------------

    private Project findOrThrow(String id) {
        return projectRepository.findById(id).orElseThrow(() -> new NotFoundException("Project not found"));
    }

    /**
     * Validates and copies fields from the request onto the project entity.
     * Mirrors the Node backend's middleware/validate.js validateProject:
     * required title on create, budget >= 0, progress 0-100, status enum,
     * valid dates with endDate >= startDate. `admin` is never accepted from
     * the request body (there's no such field on ProjectRequest at all),
     * which prevents a caller from reassigning project ownership via PUT.
     */
    private void applyValidatedFields(Project project, ProjectRequest req, boolean isCreate) {
        List<String> errors = new ArrayList<>();

        String title = req.getTitle();
        if (isCreate) {
            if (title == null || title.isBlank()) errors.add("title is required");
        } else if (title != null && title.isBlank()) {
            errors.add("title cannot be empty");
        }

        Double budget = null;
        if (req.getBudget() != null && !req.getBudget().isBlank()) {
            try {
                budget = Double.parseDouble(req.getBudget());
                if (budget < 0) errors.add("budget must be a non-negative number");
            } catch (NumberFormatException e) {
                errors.add("budget must be a non-negative number");
            }
        }

        Integer progress = null;
        if (req.getProgress() != null && !req.getProgress().isBlank()) {
            try {
                progress = (int) Math.round(Double.parseDouble(req.getProgress()));
                if (progress < 0 || progress > 100) errors.add("progress must be a number between 0 and 100");
            } catch (NumberFormatException e) {
                errors.add("progress must be a number between 0 and 100");
            }
        }

        if (req.getStatus() != null && !Project.STATUSES.contains(req.getStatus())) {
            errors.add("status must be one of: " + String.join(", ", Project.STATUSES));
        }

        LocalDate startDate = null;
        LocalDate endDate = null;
        if (req.getStartDate() != null && !req.getStartDate().isBlank()) {
            try { startDate = LocalDate.parse(req.getStartDate()); }
            catch (DateTimeParseException e) { errors.add("startDate must be a valid date"); }
        }
        if (req.getEndDate() != null && !req.getEndDate().isBlank()) {
            try { endDate = LocalDate.parse(req.getEndDate()); }
            catch (DateTimeParseException e) { errors.add("endDate must be a valid date"); }
        }
        if (startDate != null && endDate != null && endDate.isBefore(startDate)) {
            errors.add("endDate cannot be before startDate");
        }

        if (!errors.isEmpty()) throw new ValidationException(errors);

        // Apply — only overwrite fields actually supplied, matching the
        // Node version's partial-update (`findByIdAndUpdate(id, req.body)`) behaviour.
        if (title != null) project.setTitle(title);
        if (req.getDescription() != null) project.setDescription(req.getDescription());
        if (req.getLocation() != null) project.setLocation(req.getLocation());
        if (req.getStatus() != null) project.setStatus(req.getStatus());
        if (budget != null) project.setBudget(budget);
        if (progress != null) project.setProgress(progress);
        if (req.getStartDate() != null) project.setStartDate(startDate);
        if (req.getEndDate() != null) project.setEndDate(endDate);
        if (req.getEngineers() != null) project.setEngineers(req.getEngineers());
        if (req.getClients() != null) project.setClients(req.getClients());
    }

    private ProjectResponse populate(Project project) {
        return populateAll(List.of(project)).get(0);
    }

    /** Batch-loads every referenced User once instead of N+1 querying per project. */
    private List<ProjectResponse> populateAll(List<Project> projects) {
        if (projects.isEmpty()) return Collections.emptyList();

        List<String> allUserIds = new ArrayList<>();
        for (Project p : projects) {
            if (p.getAdmin() != null) allUserIds.add(p.getAdmin());
            allUserIds.addAll(p.getEngineers());
            allUserIds.addAll(p.getClients());
        }

        Map<String, User> usersById = userRepository.findByIdIn(allUserIds).stream()
                .collect(Collectors.toMap(User::getId, u -> u));

        List<ProjectResponse> result = new ArrayList<>();
        for (Project p : projects) {
            UserSummary admin = p.getAdmin() != null ? UserSummary.from(usersById.get(p.getAdmin())) : null;
            List<UserSummary> engineers = p.getEngineers().stream()
                    .map(usersById::get).filter(java.util.Objects::nonNull).map(UserSummary::from).toList();
            List<UserSummary> clients = p.getClients().stream()
                    .map(usersById::get).filter(java.util.Objects::nonNull).map(UserSummary::from).toList();
            result.add(ProjectResponse.from(p, admin, engineers, clients));
        }
        return result;
    }
}
