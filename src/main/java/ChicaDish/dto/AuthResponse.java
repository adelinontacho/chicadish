package ChicaDish.dto;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class AuthResponse {
 private String token;
 private String type = "Bearer";
 private Long id;
 private String email;
 private String firstName;
 private String lastName;
 private String role;
 private boolean newsletterSubscribed;
 
 public AuthResponse(String token, String type, Long id, String email, 
                    String firstName, String lastName, String role, 
                    boolean newsletterSubscribed) {
     this.token = token;
     this.type = type;
     this.id = id;
     this.email = email;
     this.firstName = firstName;
     this.lastName = lastName;
     this.role = role;
     this.newsletterSubscribed = newsletterSubscribed;
 }
 
 // Constructor without 'type' parameter (for backward compatibility)
 public AuthResponse(String token, Long id, String email, 
                    String firstName, String lastName, String role, 
                    boolean newsletterSubscribed) {
     this.token = token;
     this.id = id;
     this.email = email;
     this.firstName = firstName;
     this.lastName = lastName;
     this.role = role;
     this.newsletterSubscribed = newsletterSubscribed;
      
 }

public String getToken() {
	return token;
}

public void setToken(String token) {
	this.token = token;
}

public String getType() {
	return type;
}

public void setType(String type) {
	this.type = type;
}

public Long getId() {
	return id;
}

public void setId(Long id) {
	this.id = id;
}

public String getEmail() {
	return email;
}

public void setEmail(String email) {
	this.email = email;
}

public String getFirstName() {
	return firstName;
}

public void setFirstName(String firstName) {
	this.firstName = firstName;
}

public String getLastName() {
	return lastName;
}

public void setLastName(String lastName) {
	this.lastName = lastName;
}

public String getRole() {
	return role;
}

public void setRole(String role) {
	this.role = role;
}

public boolean isNewsletterSubscribed() {
	return newsletterSubscribed;
}

public void setNewsletterSubscribed(boolean newsletterSubscribed) {
	this.newsletterSubscribed = newsletterSubscribed;
}
 
 
 
 
 
 
 
 
}