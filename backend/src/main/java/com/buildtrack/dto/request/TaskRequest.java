package com.buildtrack.dto.request;

public class TaskRequest {

    private String title;
    private String description;
    private String project;
    private String assignedTo;
    private String status;
    private String priority;
    private String dueDate; // "yyyy-MM-dd" or blank

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getProject() { return project; }
    public void setProject(String project) { this.project = project; }

    public String getAssignedTo() { return assignedTo; }
    public void setAssignedTo(String assignedTo) { this.assignedTo = assignedTo; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getDueDate() { return dueDate; }
    public void setDueDate(String dueDate) { this.dueDate = dueDate; }
}
