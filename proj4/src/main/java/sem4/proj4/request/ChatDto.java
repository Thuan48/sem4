package sem4.proj4.request;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class ChatDto {
  private Integer id;
    private String chatName;
    private String chatImage;
    private boolean isGroup;
    private String lastMessageContent;
    private LocalDateTime lastMessageTimestamp;
    private String userName;
    private String userImage;
}
