package ChicaDish.controller;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import ChicaDish.dto.UserDTO;
import ChicaDish.service.UserService;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*", maxAge = 3600)
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
 
 @Autowired
 private UserService userService;
 
 @GetMapping("/users")
 public ResponseEntity<List<UserDTO>> getAllUsers() {
     List<UserDTO> users = userService.getAllUsers();
     return ResponseEntity.ok(users);
 }
 
 @GetMapping("/clients")
 public ResponseEntity<List<UserDTO>> getAllClients() {
     List<UserDTO> clients = userService.getClients();
     return ResponseEntity.ok(clients);
 }
 
 @GetMapping("/users/{id}")
 public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
     // In real implementation, you would have a method to get user by ID
     // For now, we'll return a placeholder
     return ResponseEntity.notFound().build();
 }
}
