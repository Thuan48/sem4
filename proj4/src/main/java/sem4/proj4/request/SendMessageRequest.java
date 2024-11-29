package sem4.proj4.request;

import org.springframework.web.multipart.MultipartFile;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SendMessageRequest {
  private Integer userId;
  private Integer chatId;
  private String content;
  private MultipartFile image;
}
