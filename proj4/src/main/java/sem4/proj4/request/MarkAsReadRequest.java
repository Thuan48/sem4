package sem4.proj4.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class MarkAsReadRequest {
    private Integer chatId;
    private Integer userId;
}

