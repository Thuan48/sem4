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

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/comments")
public class CommentController {

    @Autowired
    private CommentService commentService;
    
    @Autowired
    private UserService userService;

    @PostMapping("/{blogId}")
    public ResponseEntity<Comment> createComment(
            @PathVariable Integer blogId,
            @RequestBody Map<String, String> request,
            @RequestHeader("Authorization") String jwt) { 
        try {
            User user = userService.findUserProfile(jwt);
            Comment createdComment = commentService.createComment(
                blogId, 
                user.getId(), 
                request.get("content")
            );
            return ResponseEntity.ok(createdComment);
        } catch (BlogNotFoundException | UserException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @GetMapping("/{blogId}")
    public ResponseEntity<List<Comment>> getCommentsByBlogId(@PathVariable Integer blogId) {
        try {
            List<Comment> comments = commentService.getCommentsByBlogId(blogId);
            return ResponseEntity.ok(comments);
        } catch (BlogNotFoundException e) {
            return ResponseEntity.badRequest().body(null);
        }
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