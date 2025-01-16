package sem4.proj4.exception;

public class CommentException extends Exception {
    public CommentException(String message, Throwable cause) {
        super(message, cause);
    }

    public CommentException(String message) {
        super(message);
    }
}