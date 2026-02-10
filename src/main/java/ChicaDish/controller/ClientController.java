package ChicaDish.controller;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/client")
@CrossOrigin(origins = "*", maxAge = 3600)
@PreAuthorize("hasAnyRole('CLIENT', 'ADMIN')")
public class ClientController {
 
 @GetMapping("/dashboard")
 public ResponseEntity<String> getClientDashboard(Authentication authentication) {
     UserDetails userDetails = (UserDetails) authentication.getPrincipal();
     String username = userDetails.getUsername();
     
     return ResponseEntity.ok("Welcome to Client Dashboard, " + username + "!");
 }
 
 @GetMapping("/profile")
 public ResponseEntity<String> getClientProfile(Authentication authentication) {
     UserDetails userDetails = (UserDetails) authentication.getPrincipal();
     String username = userDetails.getUsername();
     
     return ResponseEntity.ok("Your Profile: " + username);
 }
}
