package ChicaDish.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users", 
    uniqueConstraints = {
        @UniqueConstraint(columnNames = "email")
    })
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
 @Id
 @GeneratedValue(strategy = GenerationType.IDENTITY)
 private Long id;
 
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
 @Size(max = 120)
 private String password;
 
 @ManyToMany(fetch = FetchType.EAGER)
 @JoinTable(name = "user_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id"))
 private Set<Role> roles = new HashSet<>();
 
 @Column(name = "newsletter_subscribed")
 private boolean newsletterSubscribed = true;
 
 @Column(name = "account_enabled")
 private boolean enabled = true;

public Long getId() {
	return id;
}

public void setId(Long id) {
	this.id = id;
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

public Set<Role> getRoles() {
	return roles;
}

public void setRoles(Set<Role> roles) {
	this.roles = roles;
}

public boolean isNewsletterSubscribed() {
	return newsletterSubscribed;
}

public void setNewsletterSubscribed(boolean newsletterSubscribed) {
	this.newsletterSubscribed = newsletterSubscribed;
}

public boolean isEnabled() {
	return enabled;
}

public void setEnabled(boolean enabled) {
	this.enabled = enabled;
}
 
 
 
 
 
 
 
}