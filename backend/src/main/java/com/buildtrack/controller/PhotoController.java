package com.buildtrack.controller;

import com.buildtrack.dto.response.PhotoResponse;
import com.buildtrack.model.User;
import com.buildtrack.security.AuthorizationUtil;
import com.buildtrack.service.PhotoService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/photos")
public class PhotoController {

    private final PhotoService photoService;

    public PhotoController(PhotoService photoService) {
        this.photoService = photoService;
    }

    @GetMapping
    public Map<String, Object> getPhotos(@RequestParam(required = false) String project) {
        return Map.of("photos", photoService.getPhotos(project));
    }

    // multipart/form-data with fields: photo (file), project, caption, category
    // — matches the FormData the React upload forms already send.
    @PostMapping(consumes = "multipart/form-data")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> uploadPhoto(
            @RequestParam("photo") MultipartFile photo,
            @RequestParam("project") String project,
            @RequestParam(value = "caption", required = false) String caption,
            @RequestParam(value = "category", required = false) String category,
            @AuthenticationPrincipal User currentUser
    ) {
        AuthorizationUtil.requireRole(currentUser, "admin", "engineer");
        PhotoResponse saved = photoService.uploadPhoto(photo, project, caption, category, currentUser);
        return Map.of("photo", saved);
    }

    @DeleteMapping("/{id}")
    public Map<String, String> deletePhoto(@PathVariable String id, @AuthenticationPrincipal User currentUser) {
        AuthorizationUtil.requireRole(currentUser, "admin", "engineer");
        photoService.deletePhoto(id);
        return Map.of("message", "Photo deleted");
    }
}
