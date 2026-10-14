package com.buildtrack.model;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "projects")
public class Project {

    public static final List<String> STATUSES = List.of("planning", "active", "on_hold", "completed");

    @Id
    private String id;

    private String title;
    private String description;
    private String location;
    private String status = "planning";

    private int progress = 0; // 0-100

    private LocalDate startDate;
    private LocalDate endDate;

    private double budget = 0;

    // Stored as User ids, same idea as Mongoose ObjectId refs. Controllers
    // return a "populated" ProjectResponse (see dto.response.ProjectResponse)
    // built by ProjectService so the frontend keeps seeing
    // { admin: {_id,name,email}, engineers: [...], clients: [...] }.
    private String admin;
    private List<String> engineers = new ArrayList<>();
    private List<String> clients = new ArrayList<>();

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

    public Project() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public int getProgress() { return progress; }
    public void setProgress(int progress) { this.progress = progress; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public double getBudget() { return budget; }
    public void setBudget(double budget) { this.budget = budget; }

    public String getAdmin() { return admin; }
    public void setAdmin(String admin) { this.admin = admin; }

    public List<String> getEngineers() { return engineers; }
    public void setEngineers(List<String> engineers) { this.engineers = engineers; }

    public List<String> getClients() { return clients; }
    public void setClients(List<String> clients) { this.clients = clients; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
