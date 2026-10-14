package com.buildtrack.dto.request;

public class ReportRequest {

    private String project;
    private String title;
    private String content;
    private String weather;
    private String workers; // numeric string, may be blank
    private String reportDate; // ISO date/time string, optional

    public String getProject() { return project; }
    public void setProject(String project) { this.project = project; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getWeather() { return weather; }
    public void setWeather(String weather) { this.weather = weather; }

    public String getWorkers() { return workers; }
    public void setWorkers(String workers) { this.workers = workers; }

    public String getReportDate() { return reportDate; }
    public void setReportDate(String reportDate) { this.reportDate = reportDate; }
}
