package sem4.proj4.request;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentRequest {
  private Integer id;
  private String content;
  private Integer blogId;
  private Map<String, Object> user; // Add this field
  private LocalDateTime createdAt;
  private Integer parentCommentId;
  private List<CommentRequest> replies = new ArrayList<>();
}
