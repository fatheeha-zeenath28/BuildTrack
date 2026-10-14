package com.buildtrack.service;

import com.buildtrack.dto.request.TaskRequest;
import com.buildtrack.dto.response.ProjectSummary;
import com.buildtrack.dto.response.TaskResponse;
import com.buildtrack.dto.response.UserSummary;
import com.buildtrack.exception.NotFoundException;
import com.buildtrack.exception.ValidationException;
import com.buildtrack.model.Project;
import com.buildtrack.model.Task;
import com.buildtrack.model.User;
import com.buildtrack.repository.ProjectRepository;
import com.buildtrack.repository.TaskRepository;
import com.buildtrack.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public TaskService(TaskRepository taskRepository, ProjectRepository projectRepository, UserRepository userRepository) {
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }

    public List<TaskResponse> getTasks(String projectId) {
        List<Task> tasks = (projectId != null && !projectId.isBlank())
                ? taskRepository.findAllByProjectOrderByCreatedAtDesc(projectId)
                : taskRepository.findAllByOrderByCreatedAtDesc();
        return tasks.stream().map(this::populate).toList();
    }

    public TaskResponse getTask(String id) {
        Task task = taskRepository.findById(id).orElseThrow(() -> new NotFoundException("Task not found"));
        return populate(task);
    }

    public TaskResponse createTask(TaskRequest req, User currentUser) {
        Task task = new Task();
        validateAndApply(task, req, true);
        task.setCreatedBy(currentUser.getId());
        Task saved = taskRepository.save(task);
        return populate(saved);
    }

    public TaskResponse updateTask(String id, TaskRequest req) {
        Task task = taskRepository.findById(id).orElseThrow(() -> new NotFoundException("Task not found"));
        validateAndApply(task, req, false);
        Task saved = taskRepository.save(task);
        return populate(saved);
    }

    public void deleteTask(String id) {
        if (!taskRepository.existsById(id)) throw new NotFoundException("Task not found");
        taskRepository.deleteById(id);
    }

    private void validateAndApply(Task task, TaskRequest req, boolean isCreate) {
        List<String> errors = new ArrayList<>();

        if (isCreate) {
            if (req.getTitle() == null || req.getTitle().isBlank()) errors.add("title is required");
            if (req.getProject() == null || req.getProject().isBlank()) errors.add("project is required");
        }

        if (req.getStatus() != null && !Task.STATUSES.contains(req.getStatus())) {
            errors.add("status must be one of: " + String.join(", ", Task.STATUSES));
        }
        if (req.getPriority() != null && !Task.PRIORITIES.contains(req.getPriority())) {
            errors.add("priority must be one of: " + String.join(", ", Task.PRIORITIES));
        }

        LocalDate dueDate = null;
        if (req.getDueDate() != null && !req.getDueDate().isBlank()) {
            try { dueDate = LocalDate.parse(req.getDueDate()); }
            catch (DateTimeParseException e) { errors.add("dueDate must be a valid date"); }
        }

        if (!errors.isEmpty()) throw new ValidationException(errors);

        if (req.getTitle() != null) task.setTitle(req.getTitle());
        if (req.getDescription() != null) task.setDescription(req.getDescription());
        if (req.getProject() != null) task.setProject(req.getProject());
        if (req.getAssignedTo() != null) task.setAssignedTo(req.getAssignedTo());
        if (req.getStatus() != null) task.setStatus(req.getStatus());
        if (req.getPriority() != null) task.setPriority(req.getPriority());
        if (req.getDueDate() != null) task.setDueDate(dueDate);
    }

    private TaskResponse populate(Task task) {
        ProjectSummary project = null;
        if (task.getProject() != null) {
            Optional<Project> p = projectRepository.findById(task.getProject());
            project = p.map(ProjectSummary::from).orElse(null);
        }
        UserSummary assignedTo = task.getAssignedTo() != null
                ? userRepository.findById(task.getAssignedTo()).map(UserSummary::from).orElse(null) : null;
        UserSummary createdBy = task.getCreatedBy() != null
                ? userRepository.findById(task.getCreatedBy()).map(UserSummary::from).orElse(null) : null;
        return TaskResponse.from(task, project, assignedTo, createdBy);
    }
}
