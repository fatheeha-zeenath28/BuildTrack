package com.buildtrack.controller;

import com.buildtrack.dto.request.ReportRequest;
import com.buildtrack.dto.response.ReportResponse;
import com.buildtrack.model.User;
import com.buildtrack.security.AuthorizationUtil;
import com.buildtrack.service.ReportService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping
    public Map<String, Object> getReports(@RequestParam(required = false) String project) {
        return Map.of("reports", reportService.getReports(project));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> createReport(@RequestBody ReportRequest req, @AuthenticationPrincipal User currentUser) {
        AuthorizationUtil.requireRole(currentUser, "admin", "engineer");
        ReportResponse report = reportService.createReport(req, currentUser);
        return Map.of("report", report);
    }

    @DeleteMapping("/{id}")
    public Map<String, String> deleteReport(@PathVariable String id, @AuthenticationPrincipal User currentUser) {
        AuthorizationUtil.requireRole(currentUser, "admin");
        reportService.deleteReport(id);
        return Map.of("message", "Report deleted");
    }
}
