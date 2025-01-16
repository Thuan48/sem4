package sem4.proj4.service;

import sem4.proj4.entity.Comment;
import sem4.proj4.exception.CommentException;
import sem4.proj4.exception.BlogNotFoundException;
import sem4.proj4.exception.UserException;
import java.util.List;

public interface CommentService {
    Comment createComment(Integer blogId, Integer userId, String content, Integer parentCommentId)
            throws BlogNotFoundException, UserException, CommentException;

    List<Comment> getCommentsByBlogId(Integer blogId) throws BlogNotFoundException;

    Comment findCommentById(Integer commentId) throws CommentException;

    void deleteComment(Integer commentId) throws CommentException;
}