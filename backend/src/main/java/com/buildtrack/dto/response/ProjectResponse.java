package com.buildtrack.dto.response;

import com.buildtrack.model.Project;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public class ProjectResponse {
    private String id;
    private String title;
    private String description;
    private String location;
    private String status;
    private int progress;
    private LocalDate startDate;
    private LocalDate endDate;
    private double budget;
    private UserSummary admin;
    private List<UserSummary> engineers;
    private List<UserSummary> clients;
    private Instant createdAt;
    private Instant updatedAt;

    public static ProjectResponse from(Project p, UserSummary admin, List<UserSummary> engineers, List<UserSummary> clients) {
        ProjectResponse r = new ProjectResponse();
        r.id = p.getId();
        r.title = p.getTitle();
        r.description = p.getDescription();
        r.location = p.getLocation();
        r.status = p.getStatus();
        r.progress = p.getProgress();
        r.startDate = p.getStartDate();
        r.endDate = p.getEndDate();
        r.budget = p.getBudget();
        r.admin = admin;
        r.engineers = engineers;
        r.clients = clients;
        r.createdAt = p.getCreatedAt();
        r.updatedAt = p.getUpdatedAt();
        return r;
    }

    public String getId() { return id; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getLocation() { return location; }
    public String getStatus() { return status; }
    public int getProgress() { return progress; }
    public LocalDate getStartDate() { return startDate; }
    public LocalDate getEndDate() { return endDate; }
    public double getBudget() { return budget; }
    public UserSummary getAdmin() { return admin; }
    public List<UserSummary> getEngineers() { return engineers; }
    public List<UserSummary> getClients() { return clients; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
