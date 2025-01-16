package sem4.proj4.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sem4.proj4.entity.Comment;
import sem4.proj4.entity.User;
import sem4.proj4.exception.BlogNotFoundException;
import sem4.proj4.exception.CommentException;
import sem4.proj4.exception.UserException;
import sem4.proj4.service.CommentService;
import sem4.proj4.service.UserService;
import sem4.proj4.request.CommentRequest;

import java.util.List;
import java.util.Map;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/comments")
public class CommentController {

    @Autowired
    private CommentService commentService;

    @Autowired
    private UserService userService;

    @PostMapping("/create")
    public ResponseEntity<CommentRequest> createComment(
            @RequestBody CommentRequest request,
            @RequestHeader("Authorization") String jwt) throws UserException, CommentException {
        User user = userService.findUserProfile(jwt);
        Comment comment = commentService.createComment(request.getBlogId(), user.getId(), request.getContent(),
                request.getParentCommentId());
        return ResponseEntity.ok(convertToCommentRequest(comment));
    }

    // Exception handler for CommentException
    @ExceptionHandler(CommentException.class)
    public ResponseEntity<Map<String, String>> handleCommentException(CommentException ex) {
        Map<String, String> response = new HashMap<>();
        response.put("error", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    // Exception handler for BlogNotFoundException
    @ExceptionHandler(BlogNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleBlogNotFoundException(BlogNotFoundException ex) {
        Map<String, String> response = new HashMap<>();
        response.put("error", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    // Exception handler for UserException
    @ExceptionHandler(UserException.class)
    public ResponseEntity<Map<String, String>> handleUserException(UserException ex) {
        Map<String, String> response = new HashMap<>();
        response.put("error", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @GetMapping("/blog/{blogId}")
    public ResponseEntity<List<CommentRequest>> getCommentsByBlog(@PathVariable Integer blogId) {
        List<Comment> comments = commentService.getCommentsByBlogId(blogId);
        List<CommentRequest> response = comments.stream()
                .filter(comment -> comment.getParentComment() == null) // Get only root comments
                .map(this::convertToCommentRequest)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    private CommentRequest convertToCommentRequest(Comment comment) {
        CommentRequest request = new CommentRequest();
        request.setId(comment.getId());
        request.setContent(comment.getContent());
        request.setBlogId(comment.getBlog().getId());

        // Add user object structure similar to blog posts
        Map<String, Object> userMap = new HashMap<>();
        userMap.put("id", comment.getUser().getId());
        userMap.put("full_name", comment.getUser().getFull_name());
        userMap.put("profile_picture", comment.getUser().getProfile_picture());
        request.setUser(userMap); // Add this field to CommentRequest

        request.setCreatedAt(comment.getCreatedAt());

        if (comment.getParentComment() != null) {
            request.setParentCommentId(comment.getParentComment().getId());
        }

        if (comment.getReplies() != null && !comment.getReplies().isEmpty()) {
            request.setReplies(
                    comment.getReplies().stream()
                            .map(this::convertToCommentRequest)
                            .collect(Collectors.toList()));
        }

        return request;
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Integer commentId,
            @RequestHeader("Authorization") String jwt) {
        try {
            User user = userService.findUserProfile(jwt);
            Comment comment = commentService.findCommentById(commentId);

            if (!comment.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            commentService.deleteComment(commentId);
            return ResponseEntity.ok().build();
        } catch (CommentException | UserException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}