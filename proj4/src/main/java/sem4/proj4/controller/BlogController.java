package sem4.proj4.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.data.domain.Page;

import sem4.proj4.entity.Blog;
import sem4.proj4.entity.User;
import sem4.proj4.exception.UserException;
import sem4.proj4.request.BlogRequest;
import sem4.proj4.response.ApiResponse;
import sem4.proj4.service.BlogService;
import sem4.proj4.service.UserService;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/blogs")
public class BlogController {

    @Autowired
    private BlogService blogService;

    @Autowired
    private UserService userService;

    @PostMapping("/create")
    public ResponseEntity<ApiResponse> createBlog(
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @RequestHeader("Authorization") String jwt) throws UserException {

        User reqUser = userService.findUserProfile(jwt);
        BlogRequest blogRequest = new BlogRequest();
        blogRequest.setTitle(title);
        blogRequest.setContent(content);
        blogRequest.setImage(image);
        blogRequest.setUserId(reqUser.getId()); // Set the user ID from the token
        blogService.createBlog(reqUser, blogRequest);
        return new ResponseEntity<>(new ApiResponse("Blog created successfully", true), HttpStatus.CREATED);
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
        response.put("content", pageBlogs.getContent());
        response.put("totalPages", pageBlogs.getTotalPages());
        response.put("totalElements", pageBlogs.getTotalElements());
        response.put("currentPage", page);
        response.put("hasNext", !pageBlogs.isLast());
        response.put("size", size);

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/delete/{blogId}")
    public ResponseEntity<ApiResponse> deleteBlog(
            @PathVariable Integer blogId,
            @RequestHeader("Authorization") String jwt) throws UserException {

        User reqUser = userService.findUserProfile(jwt);
        blogService.deleteBlog(blogId, reqUser);
        return new ResponseEntity<>(new ApiResponse("Blog deleted successfully", true), HttpStatus.OK);
    }
}
