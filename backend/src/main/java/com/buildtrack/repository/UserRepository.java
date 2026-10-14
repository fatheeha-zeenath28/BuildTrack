package com.buildtrack.repository;

import com.buildtrack.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
    List<User> findAllByOrderByNameAsc();
    List<User> findByIdIn(List<String> ids);
}
