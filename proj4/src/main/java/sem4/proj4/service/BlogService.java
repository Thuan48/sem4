package sem4.proj4.service;
import java.util.List;
import sem4.proj4.entity.Blog;
import sem4.proj4.entity.User;
import sem4.proj4.request.BlogRequest;

import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;


@Service
public interface BlogService {
  Blog createBlog(User user, BlogRequest blogRequest);
  Blog updateBlog(Integer id, String title, String content);
  Blog findBlogById(Integer id, User user);
  List<Blog> findAllBlogsByUserId(Integer userId);
  List<Blog> findAllBlogs();
  void deleteBlog(Integer id, User user);
  Page<Blog> getAllBlogs(int page, int size);
}

