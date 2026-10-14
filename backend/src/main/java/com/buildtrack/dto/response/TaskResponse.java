package com.buildtrack.dto.response;

import com.buildtrack.model.Task;

import java.time.Instant;
import java.time.LocalDate;

public class TaskResponse {
    private String id;
    private String title;
    private String description;
    private ProjectSummary project;
    private UserSummary assignedTo;
    private UserSummary createdBy;
    private String status;
    private String priority;
    private LocalDate dueDate;
    private Instant createdAt;
    private Instant updatedAt;

    public static TaskResponse from(Task t, ProjectSummary project, UserSummary assignedTo, UserSummary createdBy) {
        TaskResponse r = new TaskResponse();
        r.id = t.getId();
        r.title = t.getTitle();
        r.description = t.getDescription();
        r.project = project;
        r.assignedTo = assignedTo;
        r.createdBy = createdBy;
        r.status = t.getStatus();
        r.priority = t.getPriority();
        r.dueDate = t.getDueDate();
        r.createdAt = t.getCreatedAt();
        r.updatedAt = t.getUpdatedAt();
        return r;
    }

    public String getId() { return id; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public ProjectSummary getProject() { return project; }
    public UserSummary getAssignedTo() { return assignedTo; }
    public UserSummary getCreatedBy() { return createdBy; }
    public String getStatus() { return status; }
    public String getPriority() { return priority; }
    public LocalDate getDueDate() { return dueDate; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
