package com.buildtrack.repository;

import com.buildtrack.model.Project;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ProjectRepository extends MongoRepository<Project, String> {
    List<Project> findAllByEngineersContainingOrderByCreatedAtDesc(String engineerId);
    List<Project> findAllByClientsContainingOrderByCreatedAtDesc(String clientId);
    List<Project> findAllByOrderByCreatedAtDesc();
    long countByStatus(String status);
}
