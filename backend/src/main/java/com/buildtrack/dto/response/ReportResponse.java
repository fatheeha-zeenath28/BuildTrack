package com.buildtrack.dto.response;

import com.buildtrack.model.Report;

import java.time.Instant;
import java.util.List;

public class ReportResponse {
    private String id;
    private ProjectSummary project;
    private UserSummary author;
    private String title;
    private String content;
    private String weather;
    private int workers;
    private List<Report.Issue> issues;
    private Instant reportDate;
    private Instant createdAt;

    public static ReportResponse from(Report r, ProjectSummary project, UserSummary author) {
        ReportResponse resp = new ReportResponse();
        resp.id = r.getId();
        resp.project = project;
        resp.author = author;
        resp.title = r.getTitle();
        resp.content = r.getContent();
        resp.weather = r.getWeather();
        resp.workers = r.getWorkers();
        resp.issues = r.getIssues();
        resp.reportDate = r.getReportDate();
        resp.createdAt = r.getCreatedAt();
        return resp;
    }

    public String getId() { return id; }
    public ProjectSummary getProject() { return project; }
    public UserSummary getAuthor() { return author; }
    public String getTitle() { return title; }
    public String getContent() { return content; }
    public String getWeather() { return weather; }
    public int getWorkers() { return workers; }
    public List<Report.Issue> getIssues() { return issues; }
    public Instant getReportDate() { return reportDate; }
    public Instant getCreatedAt() { return createdAt; }
}
