package ChicaDish.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
 @NotBlank
 @Size(max = 50)
 private String firstName;
 
 @NotBlank
 @Size(max = 50)
 private String lastName;
 
 @NotBlank
 @Size(max = 120)
 @Email
 private String email;
 
 @NotBlank
 @Size(min = 6, max = 120)
 private String password;
 
 private boolean newsletterSubscribed = true;

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

public String getEmail() {
	return email;
}

public void setEmail(String email) {
	this.email = email;
}

public String getPassword() {
	return password;
}

public void setPassword(String password) {
	this.password = password;
}

public boolean isNewsletterSubscribed() {
	return newsletterSubscribed;
}

public void setNewsletterSubscribed(boolean newsletterSubscribed) {
	this.newsletterSubscribed = newsletterSubscribed;
}
 
 
 
 
 
}
