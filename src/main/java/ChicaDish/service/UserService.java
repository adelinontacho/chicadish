package ChicaDish.service;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import ChicaDish.dto.RegisterRequest;
import ChicaDish.dto.UserDTO;
import ChicaDish.enums.ERole;
import ChicaDish.model.Role;
import ChicaDish.model.User;
import ChicaDish.repository.RoleRepository;
import ChicaDish.repository.UserRepository;

@Service
public class UserService {
 
 @Autowired
 private UserRepository userRepository;
 
 @Autowired
 private RoleRepository roleRepository;
 
 @Autowired
 private PasswordEncoder passwordEncoder;
 
 public User registerUser(RegisterRequest registerRequest, boolean isAdmin) {
     if (userRepository.existsByEmail(registerRequest.getEmail())) {
         throw new RuntimeException("Error: Email is already in use!");
     }
     
     User user = new User();
     user.setFirstName(registerRequest.getFirstName());
     user.setLastName(registerRequest.getLastName());
     user.setEmail(registerRequest.getEmail());
     user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
     user.setNewsletterSubscribed(registerRequest.isNewsletterSubscribed());
     
     Set<Role> roles = new HashSet<>();
     
     if (isAdmin) {
         Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                 .orElseThrow(() -> new RuntimeException("Error: Admin role not found."));
         roles.add(adminRole);
     } else {
         Role clientRole = roleRepository.findByName(ERole.ROLE_CLIENT)
                 .orElseThrow(() -> new RuntimeException("Error: Client role not found."));
         roles.add(clientRole);
     }
     
     user.setRoles(roles);
     
     return userRepository.save(user);
 }
 
 public List<UserDTO> getAllUsers() {
     List<User> users = userRepository.findAll();
     return users.stream()
             .map(this::convertToDTO)
             .collect(Collectors.toList());
 }
 
 public List<UserDTO> getClients() {
     Role clientRole = roleRepository.findByName(ERole.ROLE_CLIENT)
             .orElseThrow(() -> new RuntimeException("Client role not found"));
     
     List<User> clients = userRepository.findAll().stream()
             .filter(user -> user.getRoles().contains(clientRole))
             .collect(Collectors.toList());
     
     return clients.stream()
             .map(this::convertToDTO)
             .collect(Collectors.toList());
 }
 
 private UserDTO convertToDTO(User user) {
     UserDTO dto = new UserDTO();
     dto.setId(user.getId());
     dto.setFirstName(user.getFirstName());
     dto.setLastName(user.getLastName());
     dto.setEmail(user.getEmail());
     dto.setNewsletterSubscribed(user.isNewsletterSubscribed());
     dto.setEnabled(user.isEnabled());
     
     // Get role
     String role = user.getRoles().stream()
             .map(r -> r.getName().name())
             .map(name -> name.replace("ROLE_", ""))
             .collect(Collectors.joining(", "));
     dto.setRole(role);
     
     return dto;
 }
}

