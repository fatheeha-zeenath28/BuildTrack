package com.buildtrack.repository;

import com.buildtrack.model.Report;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ReportRepository extends MongoRepository<Report, String> {
    List<Report> findAllByProjectOrderByReportDateDesc(String project);
    List<Report> findAllByOrderByReportDateDesc();
}
