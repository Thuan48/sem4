package sem4.proj4.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GroupChatRequest {
  private List<Integer> userIds;
  private String chat_name;
  private MultipartFile chat_image;
}
