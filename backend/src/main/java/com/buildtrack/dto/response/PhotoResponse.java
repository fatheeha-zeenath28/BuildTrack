package com.buildtrack.dto.response;

import com.buildtrack.model.Photo;

import java.time.Instant;

public class PhotoResponse {
    private String id;
    private ProjectSummary project;
    private UserSummary uploadedBy;
    private String filename;
    private String url;
    private String caption;
    private String category;
    private Instant createdAt;

    public static PhotoResponse from(Photo p, ProjectSummary project, UserSummary uploadedBy) {
        PhotoResponse r = new PhotoResponse();
        r.id = p.getId();
        r.project = project;
        r.uploadedBy = uploadedBy;
        r.filename = p.getFilename();
        r.url = p.getUrl();
        r.caption = p.getCaption();
        r.category = p.getCategory();
        r.createdAt = p.getCreatedAt();
        return r;
    }

    public String getId() { return id; }
    public ProjectSummary getProject() { return project; }
    public UserSummary getUploadedBy() { return uploadedBy; }
    public String getFilename() { return filename; }
    public String getUrl() { return url; }
    public String getCaption() { return caption; }
    public String getCategory() { return category; }
    public Instant getCreatedAt() { return createdAt; }
}
