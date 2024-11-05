package sem4.proj4.config;

import java.util.Date;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import javax.crypto.SecretKey;

@Service
public class TokenProvider {

  SecretKey key = Keys.hmacShaKeyFor(JwtConstant.SECRET_KEY.getBytes());

  public String generateToken(Authentication authentication) {
    Date now = new Date();
    Date expiryDate = new Date(now.getTime() + 604800000); // Token valid for 1 day

    return Jwts.builder()
        .setIssuer("code test")
        .setIssuedAt(now)
        .setExpiration(expiryDate)
        .claim("email", authentication.getName())
        .signWith(key)
        .compact();
  }

  public String getEmailFromToken(String jwt) {
    jwt = jwt.substring(7);
    Claims claims = Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(jwt).getBody();
    String email = String.valueOf(claims.get("email"));
    return email;
  }
}
