package ChicaDish.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {
 @Value("${app.jwt.secret}")
 private String jwtSecret;
 
 @Value("${app.jwt.expiration}")
 private int jwtExpirationMs;
 
 private Key getSigningKey() {
     return Keys.hmacShaKeyFor(jwtSecret.getBytes());
 }
 
 public String generateToken(Authentication authentication) {
     UserDetails userPrincipal = (UserDetails) authentication.getPrincipal();
     
     return Jwts.builder()
             .setSubject((userPrincipal.getUsername()))
             .setIssuedAt(new Date())
             .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
             .signWith(getSigningKey(), SignatureAlgorithm.HS512)
             .compact();
 }
 
 public String getUsernameFromToken(String token) {
     return Jwts.parserBuilder()
             .setSigningKey(getSigningKey())
             .build()
             .parseClaimsJws(token)
             .getBody()
             .getSubject();
 }
 
 public boolean validateToken(String token) {
     try {
         Jwts.parserBuilder()
             .setSigningKey(getSigningKey())
             .build()
             .parseClaimsJws(token);
         return true;
     } catch (JwtException | IllegalArgumentException e) {
         return false;
     }
 }
}