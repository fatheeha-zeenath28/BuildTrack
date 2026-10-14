package com.buildtrack.service;

import com.buildtrack.dto.request.ReportRequest;
import com.buildtrack.dto.response.ProjectSummary;
import com.buildtrack.dto.response.ReportResponse;
import com.buildtrack.dto.response.UserSummary;
import com.buildtrack.exception.NotFoundException;
import com.buildtrack.exception.ValidationException;
import com.buildtrack.model.Project;
import com.buildtrack.model.Report;
import com.buildtrack.model.User;
import com.buildtrack.repository.ProjectRepository;
import com.buildtrack.repository.ReportRepository;
import com.buildtrack.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ReportService {

    private final ReportRepository reportRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public ReportService(ReportRepository reportRepository, ProjectRepository projectRepository, UserRepository userRepository) {
        this.reportRepository = reportRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }

    public List<ReportResponse> getReports(String projectId) {
        List<Report> reports = (projectId != null && !projectId.isBlank())
                ? reportRepository.findAllByProjectOrderByReportDateDesc(projectId)
                : reportRepository.findAllByOrderByReportDateDesc();
        return reports.stream().map(this::populate).toList();
    }

    public ReportResponse createReport(ReportRequest req, User currentUser) {
        List<String> errors = new ArrayList<>();

        if (req.getProject() == null || req.getProject().isBlank()) errors.add("project is required");
        if (req.getTitle() == null || req.getTitle().isBlank()) errors.add("title is required");
        if (req.getContent() == null || req.getContent().isBlank()) errors.add("content is required");

        int workers = 0;
        if (req.getWorkers() != null && !req.getWorkers().isBlank()) {
            try {
                workers = (int) Math.round(Double.parseDouble(req.getWorkers()));
                if (workers < 0) errors.add("workers must be a non-negative number");
            } catch (NumberFormatException e) {
                errors.add("workers must be a non-negative number");
            }
        }

        Instant reportDate = Instant.now();
        if (req.getReportDate() != null && !req.getReportDate().isBlank()) {
            try { reportDate = Instant.parse(req.getReportDate()); }
            catch (DateTimeParseException e) { errors.add("reportDate must be a valid date"); }
        }

        if (!errors.isEmpty()) throw new ValidationException(errors);

        Report report = new Report();
        report.setProject(req.getProject());
        report.setTitle(req.getTitle());
        report.setContent(req.getContent());
        report.setWeather(req.getWeather());
        report.setWorkers(workers);
        report.setReportDate(reportDate);
        report.setAuthor(currentUser.getId());

        Report saved = reportRepository.save(report);
        return populate(saved);
    }

    public void deleteReport(String id) {
        if (!reportRepository.existsById(id)) throw new NotFoundException("Report not found");
        reportRepository.deleteById(id);
    }

    private ReportResponse populate(Report report) {
        ProjectSummary project = null;
        if (report.getProject() != null) {
            Optional<Project> p = projectRepository.findById(report.getProject());
            project = p.map(ProjectSummary::from).orElse(null);
        }
        UserSummary author = report.getAuthor() != null
                ? userRepository.findById(report.getAuthor()).map(UserSummary::from).orElse(null) : null;
        return ReportResponse.from(report, project, author);
    }
}
