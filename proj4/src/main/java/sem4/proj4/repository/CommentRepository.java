package sem4.proj4.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import sem4.proj4.entity.Comment;
import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Integer> {
    List<Comment> findByBlogId(Integer blogId);
}