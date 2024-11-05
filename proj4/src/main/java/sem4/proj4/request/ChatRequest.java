package sem4.proj4.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatRequest {
  private Integer userId;
  private String chatName; 
  private String chatImage;
}
