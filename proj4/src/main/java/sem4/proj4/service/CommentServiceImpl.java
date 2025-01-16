package sem4.proj4.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import sem4.proj4.entity.Blog;
import sem4.proj4.entity.Comment;
import sem4.proj4.entity.User;
import sem4.proj4.exception.BlogNotFoundException;
import sem4.proj4.exception.CommentException;
import sem4.proj4.exception.UserException;
import sem4.proj4.repository.BlogRepository;
import sem4.proj4.repository.CommentRepository;
import sem4.proj4.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

@Service
public class CommentServiceImpl implements CommentService {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private BlogRepository blogRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public Comment createComment(Integer blogId, Integer userId, String content, Integer parentCommentId)
            throws BlogNotFoundException, UserException, CommentException {
        try {
            Blog blog = blogRepository.findById(blogId)
                    .orElseThrow(() -> new BlogNotFoundException("Blog not found with ID: " + blogId));
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new UserException("User not found with ID: " + userId));

            Comment comment = new Comment();
            comment.setBlog(blog);
            comment.setUser(user);
            comment.setContent(content);
            comment.setCreatedAt(LocalDateTime.now());

            if (parentCommentId != null) {
                Comment parentComment = commentRepository.findById(parentCommentId)
                        .orElseThrow(
                                () -> new CommentException("Parent comment not found with ID: " + parentCommentId));
                comment.setParentComment(parentComment);
            } else {
                comment.setParentComment(null); // Explicitly set to null
            }

            return commentRepository.save(comment);
        } catch (BlogNotFoundException | UserException | CommentException e) {
            // Re-throw custom exceptions to be handled by the controller
            throw e;
        } catch (Exception e) {
            // Wrap any other exceptions in CommentException
            throw new CommentException("Failed to create comment: " + e.getMessage(), e);
        }
    }

    @Override
    public List<Comment> getCommentsByBlogId(Integer blogId) throws BlogNotFoundException {
        if (!blogRepository.existsById(blogId)) {
            throw new BlogNotFoundException("Blog not found");
        }
        List<Comment> comments = commentRepository.findByBlogId(blogId);
        return comments != null ? comments : new ArrayList<>();
    }

    @Override
    public Comment findCommentById(Integer commentId) throws CommentException {
        return commentRepository.findById(commentId)
                .orElseThrow(() -> new CommentException("Comment not found with ID: " + commentId));
    }

    @Override
    public void deleteComment(Integer commentId) throws CommentException {
        if (!commentRepository.existsById(commentId)) {
            throw new CommentException("Comment not found");
        }
        commentRepository.deleteById(commentId);
    }
}