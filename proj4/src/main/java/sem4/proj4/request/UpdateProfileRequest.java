package sem4.proj4.request;

import java.time.LocalDate;

import org.springframework.format.annotation.DateTimeFormat;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateProfileRequest {
  private String bio;
  private String gender;
  private String phone;
  private String address;
  @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
  private LocalDate dob;
}
