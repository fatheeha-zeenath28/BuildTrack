package com.buildtrack.dto.response;

public class ProjectStatsResponse {
    private long total;
    private long active;
    private long completed;
    private long planning;
    private long avgProgress;

    public ProjectStatsResponse(long total, long active, long completed, long planning, long avgProgress) {
        this.total = total;
        this.active = active;
        this.completed = completed;
        this.planning = planning;
        this.avgProgress = avgProgress;
    }

    public long getTotal() { return total; }
    public long getActive() { return active; }
    public long getCompleted() { return completed; }
    public long getPlanning() { return planning; }
    public long getAvgProgress() { return avgProgress; }
}
