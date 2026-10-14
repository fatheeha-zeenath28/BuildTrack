package com.buildtrack.controller;

import com.buildtrack.dto.request.ProjectRequest;
import com.buildtrack.dto.response.ProjectResponse;
import com.buildtrack.dto.response.ProjectStatsResponse;
import com.buildtrack.model.User;
import com.buildtrack.security.AuthorizationUtil;
import com.buildtrack.service.ProjectService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @GetMapping("/stats")
    public ProjectStatsResponse stats(@AuthenticationPrincipal User currentUser) {
        AuthorizationUtil.requireRole(currentUser, "admin");
        return projectService.getStats();
    }

    @GetMapping
    public Map<String, Object> getProjects(@AuthenticationPrincipal User currentUser) {
        return Map.of("projects", projectService.getProjects(currentUser));
    }

    @GetMapping("/{id}")
    public Map<String, Object> getProject(@PathVariable String id) {
        return Map.of("project", projectService.getProject(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> createProject(@RequestBody ProjectRequest req, @AuthenticationPrincipal User currentUser) {
        AuthorizationUtil.requireRole(currentUser, "admin");
        ProjectResponse project = projectService.createProject(req, currentUser);
        return Map.of("project", project);
    }

    @PutMapping("/{id}")
    public Map<String, Object> updateProject(@PathVariable String id, @RequestBody ProjectRequest req,
                                              @AuthenticationPrincipal User currentUser) {
        AuthorizationUtil.requireRole(currentUser, "admin", "engineer");
        ProjectResponse project = projectService.updateProject(id, req, currentUser);
        return Map.of("project", project);
    }

    @DeleteMapping("/{id}")
    public Map<String, String> deleteProject(@PathVariable String id, @AuthenticationPrincipal User currentUser) {
        AuthorizationUtil.requireRole(currentUser, "admin");
        projectService.deleteProject(id);
        return Map.of("message", "Project deleted");
    }
}
