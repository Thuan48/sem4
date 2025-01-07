package sem4.proj4.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Pageable;
import sem4.proj4.entity.Blog;
import sem4.proj4.entity.User;
import sem4.proj4.exception.BlogNotFoundException;
import sem4.proj4.repository.BlogRepository;
import sem4.proj4.request.BlogRequest;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.logging.Logger;

@Service
public class BlogServiceImplement implements BlogService {

    @Autowired
    private BlogRepository blogRepository;

    @Value("${config-upload-dir}")
    private String uploadDir;

    private static final Logger logger = Logger.getLogger(BlogServiceImplement.class.getName());

    @Override
    public Blog createBlog(User user, BlogRequest blogRequest) {
        Blog blog = new Blog();
        blog.setTitle(blogRequest.getTitle());
        blog.setContent(blogRequest.getContent());
        blog.setUser(user);
        blog.setCreateTime(LocalDateTime.now());
        blog.setUpdateTime(LocalDateTime.now());

        if (blogRequest.getImage() != null && !blogRequest.getImage().isEmpty()) {
            try {
                Path path = Paths.get(uploadDir + "/blogs");
                if (!Files.exists(path)) {
                    Files.createDirectories(path);
                    logger.info("Directories created: " + path.toAbsolutePath().toString());
                } else {
                    logger.info("Directories already exist: " + path.toAbsolutePath().toString());
                }

                String filename = blogRequest.getImage().getOriginalFilename();
                Path filePath = path.resolve(filename);
                Files.copy(blogRequest.getImage().getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

                blog.setImage(filename);
            } catch (Exception e) {
                e.printStackTrace();
                throw new RuntimeException("Error while uploading blog image: " + e.getMessage());
            }
        }

        return blogRepository.save(blog);
    }

    @Override
    public Blog updateBlog(Integer id, String title, String content) {
        Blog blog = blogRepository.findById(id)
                .orElseThrow(() -> new BlogNotFoundException("Blog not found with ID: " + id));
        blog.setTitle(title);
        blog.setContent(content);
        blog.setUpdateTime(LocalDateTime.now());

        return blogRepository.save(blog);
    }

    @Override
    public Blog findBlogById(Integer id, User user) {
        return blogRepository.findById(id)
                .orElseThrow(() -> new BlogNotFoundException("Blog not found with ID: " + id));
    }

    @Override
    public List<Blog> findAllBlogsByUserId(Integer userId) {
        return blogRepository.findByUserId(userId);
    }

    @Override
    public List<Blog> findAllBlogs() {
        return blogRepository.findAll();
    }

    @Override
    public void deleteBlog(Integer id, User user) {
        if (!blogRepository.existsById(id)) {
            throw new BlogNotFoundException("Blog not found with ID: " + id);
        }
        blogRepository.deleteById(id);
    }

    @Override
    public Page<Blog> getAllBlogs(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return blogRepository.findAll(pageable);
    }
    
}
