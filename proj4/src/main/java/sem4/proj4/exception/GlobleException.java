package sem4.proj4.exception;

import java.time.LocalDateTime;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.NoHandlerFoundException;

@RestControllerAdvice
public class GlobleException {

  @ExceptionHandler(UserException.class)
  public ResponseEntity<ErrorDetail> UserExceptionHandler(UserException e, WebRequest req) {
    ErrorDetail err = new ErrorDetail(e.getMessage(), req.getDescription(false), LocalDateTime.now());
    return new ResponseEntity<ErrorDetail>(err, HttpStatus.BAD_REQUEST);
  }
  
  @ExceptionHandler(MessageException.class)
  public ResponseEntity<ErrorDetail> MessageExceptionHandler(MessageException e, WebRequest req) {
    ErrorDetail err = new ErrorDetail(e.getMessage(), req.getDescription(false), LocalDateTime.now());
    return new ResponseEntity<ErrorDetail>(err, HttpStatus.BAD_REQUEST);
  }

  @ExceptionHandler(ChatException.class)
  public ResponseEntity<ErrorDetail> ChatExceptionHandler(ChatException e, WebRequest req) {
    ErrorDetail err = new ErrorDetail(e.getMessage(), req.getDescription(false), LocalDateTime.now());
    return new ResponseEntity<ErrorDetail>(err, HttpStatus.BAD_REQUEST);
  }

  @ExceptionHandler(NoHandlerFoundException.class)
  public ResponseEntity<ErrorDetail> handleNoHandleFoundException(NoHandlerFoundException e, WebRequest req) {
    ErrorDetail err = new ErrorDetail("Endpoint not pound",e.getMessage(), LocalDateTime.now());
    return new ResponseEntity<>(err, HttpStatus.NOT_FOUND);
  }
  
  @ExceptionHandler(Exception.class)
  public ResponseEntity<ErrorDetail> otherExceptionHandler(Exception e, WebRequest req) {
    ErrorDetail err = new ErrorDetail(e.getMessage(), req.getDescription(false), LocalDateTime.now());
    return new ResponseEntity<ErrorDetail>(err, HttpStatus.BAD_REQUEST);
  }
}
