package com.buildtrack.dto.request;

import java.util.List;

/**
 * Fields are intentionally loosely typed (String for budget/progress/dates)
 * because the React forms sometimes send numbers as JSON numbers (e.g. the
 * progress slider) and sometimes as strings from plain <input> values —
 * Jackson will happily bind either a JSON string or JSON number into a
 * String field. ProjectService does the real parsing/range/enum validation,
 * mirroring the Node backend's middleware/validate.js.
 */
public class ProjectRequest {

    private String title;
    private String description;
    private String location;
    private String status;
    private String startDate; // "yyyy-MM-dd" or blank
    private String endDate;   // "yyyy-MM-dd" or blank
    private String budget;
    private String progress;
    private List<String> engineers;
    private List<String> clients;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getStartDate() { return startDate; }
    public void setStartDate(String startDate) { this.startDate = startDate; }

    public String getEndDate() { return endDate; }
    public void setEndDate(String endDate) { this.endDate = endDate; }

    public String getBudget() { return budget; }
    public void setBudget(String budget) { this.budget = budget; }

    public String getProgress() { return progress; }
    public void setProgress(String progress) { this.progress = progress; }

    public List<String> getEngineers() { return engineers; }
    public void setEngineers(List<String> engineers) { this.engineers = engineers; }

    public List<String> getClients() { return clients; }
    public void setClients(List<String> clients) { this.clients = clients; }
}
