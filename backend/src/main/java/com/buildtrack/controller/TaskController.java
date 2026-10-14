package com.buildtrack.controller;

import com.buildtrack.dto.request.TaskRequest;
import com.buildtrack.dto.response.TaskResponse;
import com.buildtrack.model.User;
import com.buildtrack.security.AuthorizationUtil;
import com.buildtrack.service.TaskService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping
    public Map<String, Object> getTasks(@RequestParam(required = false) String project) {
        return Map.of("tasks", taskService.getTasks(project));
    }

    @GetMapping("/{id}")
    public Map<String, Object> getTask(@PathVariable String id) {
        return Map.of("task", taskService.getTask(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> createTask(@RequestBody TaskRequest req, @AuthenticationPrincipal User currentUser) {
        AuthorizationUtil.requireRole(currentUser, "admin", "engineer");
        TaskResponse task = taskService.createTask(req, currentUser);
        return Map.of("task", task);
    }

    @PutMapping("/{id}")
    public Map<String, Object> updateTask(@PathVariable String id, @RequestBody TaskRequest req,
                                           @AuthenticationPrincipal User currentUser) {
        AuthorizationUtil.requireRole(currentUser, "admin", "engineer");
        TaskResponse task = taskService.updateTask(id, req);
        return Map.of("task", task);
    }

    @DeleteMapping("/{id}")
    public Map<String, String> deleteTask(@PathVariable String id, @AuthenticationPrincipal User currentUser) {
        AuthorizationUtil.requireRole(currentUser, "admin");
        taskService.deleteTask(id);
        return Map.of("message", "Task deleted");
    }
}
