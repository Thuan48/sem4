package sem4.proj4.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Pageable;
import sem4.proj4.entity.Blog;
import sem4.proj4.entity.User;
import sem4.proj4.exception.BlogNotFoundException;
import sem4.proj4.repository.BlogRepository;
import sem4.proj4.request.BlogRequest;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.logging.Logger;
import java.util.UUID;
import java.io.IOException;
import org.springframework.web.multipart.MultipartFile;
import jakarta.transaction.Transactional;

@Service
public class BlogServiceImplement implements BlogService {

    @Autowired
    private BlogRepository blogRepository;

    @Value("${config-upload-dir}")
    private String uploadDir;

    private static final Logger logger = Logger.getLogger(BlogServiceImplement.class.getName());

    @Override
    @Transactional
    public Blog createBlog(User user, BlogRequest blogRequest) {
        Blog blog = new Blog();
        blog.setContent(blogRequest.getContent());
        blog.setUser(user);
        blog.setCreateTime(LocalDateTime.now());
        blog.setUpdateTime(LocalDateTime.now());

        Set<String> savedImageNames = new HashSet<>();

        if (blogRequest.getImages() != null && !blogRequest.getImages().isEmpty()) {
            try {
                // Create full path including static/uploads/blogs
                Path uploadPath = Paths.get("proj4/src/main/resources/static/uploads/blogs");
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                    logger.info("Created directories: " + uploadPath.toAbsolutePath());
                }

                for (MultipartFile image : blogRequest.getImages()) {
                    // Validate image
                    if (!isValidImage(image)) {
                        throw new IllegalArgumentException("Invalid image file");
                    }

                    // Generate unique filename
                    String uniqueFileName = generateUniqueFileName(image);
                    Path filePath = uploadPath.resolve(uniqueFileName);

                    // Save image file
                    Files.copy(image.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

                    // Add filename to set
                    savedImageNames.add(uniqueFileName);
                }

                blog.setImages(savedImageNames);
            } catch (IOException e) {
                logger.severe("Error saving blog images: " + e.getMessage());
                cleanupSavedImages(savedImageNames);
                throw new RuntimeException("Failed to save blog images", e);
            }
        }

        try {
            return blogRepository.save(blog);
        } catch (Exception e) {
            // Cleanup images if blog save fails
            cleanupSavedImages(savedImageNames);
            throw e;
        }
    }

    private boolean isValidImage(MultipartFile file) {
        String contentType = file.getContentType();
        return contentType != null && contentType.startsWith("image/");
    }

    private String generateUniqueFileName(MultipartFile file) {
        return UUID.randomUUID().toString() + "_" +
                file.getOriginalFilename().replaceAll("[^a-zA-Z0-9.]", "_");
    }

    private void cleanupSavedImages(Set<String> imageNames) {
        if (imageNames != null) {
            Path uploadPath = Paths.get("proj4/src/main/resources/static/uploads/blogs");
            imageNames.forEach(imageName -> {
                try {
                    Files.deleteIfExists(uploadPath.resolve(imageName));
                } catch (IOException e) {
                    logger.warning("Failed to cleanup image: " + imageName);
                }
            });
        }
    }

    @Override
    public Blog updateBlog(Integer id, String content) {
        Blog blog = blogRepository.findById(id)
                .orElseThrow(() -> new BlogNotFoundException("Blog not found with ID: " + id));
        blog.setContent(content);
        blog.setUpdateTime(LocalDateTime.now());

        return blogRepository.save(blog);
    }

    @Override
    public Blog findBlogById(Integer id, User user) {
        return blogRepository.findById(id)
                .orElseThrow(() -> new BlogNotFoundException("Blog not found with ID: " + id));
    }

    @Override
    public List<Blog> findAllBlogsByUserId(Integer userId) {
        return blogRepository.findByUserId(userId);
    }

    @Override
    public List<Blog> findAllBlogs() {
        return blogRepository.findAll();
    }

    @Override
    public void deleteBlog(Integer id, User user) {
        if (!blogRepository.existsById(id)) {
            throw new BlogNotFoundException("Blog not found with ID: " + id);
        }
        blogRepository.deleteById(id);
    }

    @Override
    public Page<Blog> getAllBlogs(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return blogRepository.findAll(pageable);
    }

    // private String saveImage(MultipartFile file) throws IOException {
    // String uniqueFileName = UUID.randomUUID().toString() + "_" +
    // file.getOriginalFilename();
    // Path uploadPath = Paths.get(uploadDir + "/blogs");

    // if (!Files.exists(uploadPath)) {
    // Files.createDirectories(uploadPath);
    // }

    // Path filePath = uploadPath.resolve(uniqueFileName);
    // Files.copy(file.getInputStream(), filePath,
    // StandardCopyOption.REPLACE_EXISTING);

    // return uniqueFileName;
    // }
}
