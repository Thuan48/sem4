package sem4.proj4.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.data.domain.Page;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.beans.factory.annotation.Value;

import sem4.proj4.entity.Blog;
import sem4.proj4.entity.User;
import sem4.proj4.exception.UserException;
import sem4.proj4.repository.BlogRepository;
import sem4.proj4.repository.UserRepository;
import sem4.proj4.request.BlogRequest;
import sem4.proj4.response.ApiResponse;
import sem4.proj4.service.BlogService;
import sem4.proj4.service.UserService;
import sem4.proj4.config.TokenProvider;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/blogs")
public class BlogController {

    @Autowired
    private BlogService blogService;
    @Autowired
    private UserService userService;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private TokenProvider TokenProvider;

    @Value("${config-upload-dir}")
    private String uploadDir; // Add this field

    @PostMapping("/create")
    public ResponseEntity<?> createBlog(
            @RequestPart("content") String content,
            @RequestPart(value = "images", required = false) List<MultipartFile> images,
            @RequestHeader("Authorization") String token) {
        try {
            String userId = TokenProvider.getEmailFromToken(token);
            User user = userRepository.findByEmail(userId);
            if (user == null) {
                throw new RuntimeException("User not found");
            }

            // Create BlogRequest object
            BlogRequest blogRequest = new BlogRequest();
            blogRequest.setContent(content);
            blogRequest.setImages(images);

            // Create blog using service
            Blog createdBlog = blogService.createBlog(user, blogRequest);
            return ResponseEntity.ok(createdBlog);
        } catch (Exception e) {
            // logger.error("Error creating blog: ", e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse("Error creating blog: " + e.getMessage(), false));
        }
    }

    // Add this validation method
    private void validateImages(List<MultipartFile> images) {
        if (images != null) {
            for (MultipartFile image : images) {
                if (image.getSize() > 5242880) { // 5MB limit
                    throw new IllegalArgumentException("Image size must be less than 5MB");
                }
                String contentType = image.getContentType();
                if (contentType == null || !contentType.startsWith("image/")) {
                    throw new IllegalArgumentException("File must be an image");
                }
            }
        }
    }

    @GetMapping("/{blogId}")
    public ResponseEntity<Blog> getBlogById(
            @PathVariable Integer blogId,
            @RequestHeader("Authorization") String jwt) throws UserException {

        User reqUser = userService.findUserProfile(jwt);
        Blog blog = blogService.findBlogById(blogId, reqUser);
        return new ResponseEntity<>(blog, HttpStatus.OK);
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllBlogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<Blog> pageBlogs = blogService.getAllBlogs(page, size);

        Map<String, Object> response = new HashMap<>();
        response.put("content", pageBlogs.getContent().stream()
                .map(this::simplifyBlog)
                .collect(Collectors.toList()));
        response.put("totalPages", pageBlogs.getTotalPages());
        response.put("totalElements", pageBlogs.getTotalElements());
        response.put("currentPage", page);
        response.put("hasNext", !pageBlogs.isLast());
        response.put("size", size);

        return ResponseEntity.ok(response);
    }

    private Map<String, Object> simplifyBlog(Blog blog) {
        Map<String, Object> simplifiedBlog = new HashMap<>();
        simplifiedBlog.put("id", blog.getId());
        simplifiedBlog.put("content", blog.getContent());
        simplifiedBlog.put("image", blog.getImages());
        simplifiedBlog.put("createTime", blog.getCreateTime());
        // Add user information with consistent naming
        Map<String, Object> user = new HashMap<>();
        user.put("id", blog.getUser().getId());
        user.put("full_name", blog.getUser().getFull_name());
        user.put("profile_picture", blog.getUser().getProfile_picture());
        simplifiedBlog.put("user", user);
        return simplifiedBlog;
    }

    @DeleteMapping("/delete/{blogId}")
    public ResponseEntity<ApiResponse> deleteBlog(
            @PathVariable Integer blogId,
            @RequestHeader("Authorization") String jwt) throws UserException {
        System.out.println("Attempting to delete blog: " + blogId); // Add logging
        User reqUser = userService.findUserProfile(jwt);
        System.out.println("User attempting deletion: " + reqUser.getId()); // Add logging
        blogService.deleteBlog(blogId, reqUser);
        return new ResponseEntity<>(new ApiResponse("Blog deleted successfully", true), HttpStatus.OK);
    }
}
