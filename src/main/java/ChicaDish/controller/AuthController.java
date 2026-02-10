package ChicaDish.controller;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import ChicaDish.dto.AuthRequest;
import ChicaDish.dto.AuthResponse;
import ChicaDish.dto.RegisterRequest;
import ChicaDish.model.User;
import ChicaDish.model.UserPrincipal;
import ChicaDish.security.JwtUtil;
import ChicaDish.service.UserService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {
 
 @Autowired
 private AuthenticationManager authenticationManager;
 
 @Autowired
 private JwtUtil jwtUtil;
 
 @Autowired
 private UserService userService;
 
 @PostMapping("/login")
 public ResponseEntity<?> authenticateUser(@Valid @RequestBody AuthRequest authRequest) {
     Authentication authentication = authenticationManager.authenticate(
             new UsernamePasswordAuthenticationToken(
                     authRequest.getEmail(),
                     authRequest.getPassword()
             )
     );
     
     SecurityContextHolder.getContext().setAuthentication(authentication);
     String jwt = jwtUtil.generateToken(authentication);
     
     UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
     
     // Get role
     String role = userPrincipal.getAuthorities().stream()
             .map(item -> item.getAuthority())
             .map(name -> name.replace("ROLE_", ""))
             .collect(Collectors.joining(", "));
     
     AuthResponse response = new AuthResponse(
             jwt,
             "Bearer",
             userPrincipal.getId(),
             userPrincipal.getEmail(),
             userPrincipal.getFirstName(),
             userPrincipal.getLastName(),
             role,
             true
     );
     
     return ResponseEntity.ok(response);
 }
 
 @PostMapping("/register/client")
 public ResponseEntity<?> registerClient(@Valid @RequestBody RegisterRequest registerRequest) {
     User user = userService.registerUser(registerRequest, false);
     
     // Auto login after registration
     Authentication authentication = authenticationManager.authenticate(
             new UsernamePasswordAuthenticationToken(
                     registerRequest.getEmail(),
                     registerRequest.getPassword()
             )
     );
     
     SecurityContextHolder.getContext().setAuthentication(authentication);
     String jwt = jwtUtil.generateToken(authentication);
     
     String role = "CLIENT";
     
     AuthResponse response = new AuthResponse(
             jwt,
             "Bearer",
             user.getId(),
             user.getEmail(),
             user.getFirstName(),
             user.getLastName(),
             role,
             user.isNewsletterSubscribed()
     );
     
     return ResponseEntity.ok(response);
 }
 
 @PostMapping("/register/admin")
 public ResponseEntity<?> registerAdmin(@Valid @RequestBody RegisterRequest registerRequest) {
     User user = userService.registerUser(registerRequest, true);
     
     // Auto login after registration
     Authentication authentication = authenticationManager.authenticate(
             new UsernamePasswordAuthenticationToken(
                     registerRequest.getEmail(),
                     registerRequest.getPassword()
             )
     );
     
     SecurityContextHolder.getContext().setAuthentication(authentication);
     String jwt = jwtUtil.generateToken(authentication);
     
     String role = "ADMIN";
     
     AuthResponse response = new AuthResponse(
             jwt,
             "Bearer",
             user.getId(),
             user.getEmail(),
             user.getFirstName(),
             user.getLastName(),
             role,
             user.isNewsletterSubscribed()
     );
     
     return ResponseEntity.ok(response);
 }
 
 @GetMapping("/me")
 public ResponseEntity<?> getCurrentUser(Authentication authentication) {
     if (authentication == null) {
         return ResponseEntity.status(401).body("Not authenticated");
     }
     
     UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
     
     String role = userPrincipal.getAuthorities().stream()
             .map(item -> item.getAuthority())
             .map(name -> name.replace("ROLE_", ""))
             .collect(Collectors.joining(", "));
     
     AuthResponse response = new AuthResponse(
             null,
             null,
             userPrincipal.getId(),
             userPrincipal.getEmail(),
             userPrincipal.getFirstName(),
             userPrincipal.getLastName(),
             role,
             true
     );
     
     return ResponseEntity.ok(response);
 }
}
