package com.buildtrack.dto.response;

import com.buildtrack.model.Project;

/** Equivalent of Mongoose's `.populate('project', 'title')`. */
public class ProjectSummary {
    private String id;
    private String title;

    public static ProjectSummary from(Project p) {
        if (p == null) return null;
        ProjectSummary s = new ProjectSummary();
        s.id = p.getId();
        s.title = p.getTitle();
        return s;
    }

    public String getId() { return id; }
    public String getTitle() { return title; }
}
