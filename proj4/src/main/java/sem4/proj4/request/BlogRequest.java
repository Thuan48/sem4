package sem4.proj4.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import sem4.proj4.entity.User;

import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BlogRequest {
    private String title;
    private String content;
    private List<MultipartFile> images;
    private User userId;
    private List<String> existingImages = new ArrayList<>(); // Initialize with empty list

    public List<MultipartFile> getImages() {
        return images;
    }

    public void setImages(List<MultipartFile> images) {
        this.images = images;
    }

    public List<String> getExistingImages() {
        return existingImages;
    }

    public void setExistingImages(List<String> existingImages) {
        this.existingImages = existingImages;
    }

    // Add validation method
    public void validate() {
        if (content == null || content.trim().isEmpty()) {
            throw new IllegalArgumentException("Content cannot be empty");
        }
    }
}