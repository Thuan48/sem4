package sem4.proj4.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import sem4.proj4.entity.Blog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface BlogRepository extends JpaRepository<Blog, Integer> {
  Page<Blog> findAll(Pageable pageable);

  List<Blog> findByUserId(Integer userId);

  boolean existsById(Integer blogId);
}