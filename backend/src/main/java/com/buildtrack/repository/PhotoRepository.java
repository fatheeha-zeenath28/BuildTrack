package com.buildtrack.repository;

import com.buildtrack.model.Photo;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface PhotoRepository extends MongoRepository<Photo, String> {
    List<Photo> findAllByProjectOrderByCreatedAtDesc(String project);
    List<Photo> findAllByOrderByCreatedAtDesc();
}
