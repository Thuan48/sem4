package sem4.proj4.exception;

public class BlogNotFoundException extends RuntimeException {
  public BlogNotFoundException(String message) {
      super(message);
  }
}
