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

@Service
public class CommentServiceImpl implements CommentService {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private BlogRepository blogRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public Comment createComment(Integer blogId, Integer userId, String content) throws BlogNotFoundException, UserException {
        Blog blog = blogRepository.findById(blogId).orElseThrow(() -> new BlogNotFoundException("Blog not found"));
        User user = userRepository.findById(userId).orElseThrow(() -> new UserException("User not found"));
        Comment comment = new Comment();
        comment.setBlog(blog);
        comment.setUser(user);
        comment.setContent(content);
        comment.setCreatedAt(LocalDateTime.now());
        return commentRepository.save(comment);
    }

    @Override
    public List<Comment> getCommentsByBlogId(Integer blogId) throws BlogNotFoundException {
        if (!blogRepository.existsById(blogId)) {
            throw new BlogNotFoundException("Blog not found");
        }
        return commentRepository.findByBlogId(blogId);
    }

    @Override
    public Comment findCommentById(Integer commentId) throws CommentException {
        return commentRepository.findById(commentId).orElseThrow(() -> new CommentException("Comment not found"));
    }

    @Override
    public void deleteComment(Integer commentId) throws CommentException {
        if (!commentRepository.existsById(commentId)) {
            throw new CommentException("Comment not found");
        }
        commentRepository.deleteById(commentId);
    }
}