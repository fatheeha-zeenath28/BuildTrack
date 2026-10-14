package com.buildtrack.repository;

import com.buildtrack.model.Task;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface TaskRepository extends MongoRepository<Task, String> {
    List<Task> findAllByProjectOrderByCreatedAtDesc(String project);
    List<Task> findAllByOrderByCreatedAtDesc();
}
