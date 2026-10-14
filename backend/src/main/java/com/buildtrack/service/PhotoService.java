package com.buildtrack.service;

import com.buildtrack.dto.response.PhotoResponse;
import com.buildtrack.dto.response.ProjectSummary;
import com.buildtrack.dto.response.UserSummary;
import com.buildtrack.exception.NotFoundException;
import com.buildtrack.exception.ValidationException;
import com.buildtrack.model.Photo;
import com.buildtrack.model.Project;
import com.buildtrack.model.User;
import com.buildtrack.repository.PhotoRepository;
import com.buildtrack.repository.ProjectRepository;
import com.buildtrack.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

@Service
public class PhotoService {

    private final PhotoRepository photoRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    public PhotoService(PhotoRepository photoRepository, ProjectRepository projectRepository,
                         UserRepository userRepository, FileStorageService fileStorageService) {
        this.photoRepository = photoRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.fileStorageService = fileStorageService;
    }

    public List<PhotoResponse> getPhotos(String projectId) {
        List<Photo> photos = (projectId != null && !projectId.isBlank())
                ? photoRepository.findAllByProjectOrderByCreatedAtDesc(projectId)
                : photoRepository.findAllByOrderByCreatedAtDesc();
        return photos.stream().map(this::populate).toList();
    }

    public PhotoResponse uploadPhoto(MultipartFile file, String projectId, String caption, String category, User currentUser) {
        if (projectId == null || projectId.isBlank()) {
            throw new ValidationException(List.of("project is required"));
        }
        if (category != null && !category.isBlank() && !Photo.CATEGORIES.contains(category)) {
            throw new ValidationException(List.of("category must be one of: " + String.join(", ", Photo.CATEGORIES)));
        }

        // FileStorageService throws IllegalArgumentException for "no file" / "not an image",
        // which GlobalExceptionHandler maps to a 400 — matching the Node multer fileFilter behaviour.
        String filename = fileStorageService.store(file);

        Photo photo = new Photo();
        photo.setProject(projectId);
        photo.setUploadedBy(currentUser.getId());
        photo.setFilename(filename);
        photo.setUrl("/uploads/" + filename);
        photo.setCaption(caption);
        photo.setCategory((category == null || category.isBlank()) ? "progress" : category);

        Photo saved = photoRepository.save(photo);
        return populate(saved);
    }

    public void deletePhoto(String id) {
        if (!photoRepository.existsById(id)) throw new NotFoundException("Photo not found");
        photoRepository.deleteById(id);
        // Note: like the original Node implementation, this only removes the
        // database record — it doesn't delete the underlying file from disk.
    }

    private PhotoResponse populate(Photo photo) {
        ProjectSummary project = null;
        if (photo.getProject() != null) {
            Optional<Project> p = projectRepository.findById(photo.getProject());
            project = p.map(ProjectSummary::from).orElse(null);
        }
        UserSummary uploadedBy = photo.getUploadedBy() != null
                ? userRepository.findById(photo.getUploadedBy()).map(UserSummary::from).orElse(null) : null;
        return PhotoResponse.from(photo, project, uploadedBy);
    }
}
