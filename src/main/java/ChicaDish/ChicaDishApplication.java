package ChicaDish;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import ChicaDish.enums.ERole;
import ChicaDish.model.Role;
import ChicaDish.repository.RoleRepository;

@SpringBootApplication
public class ChicaDishApplication {

	public static void main(String[] args) {
		SpringApplication.run(ChicaDishApplication.class, args);
	}
	
	 @Bean
	    CommandLineRunner initializeRoles(RoleRepository roleRepository) {
	        return args -> {
	            // Create roles if they don't exist
	            if (roleRepository.findByName(ERole.ROLE_CLIENT).isEmpty()) {
	                Role clientRole = new Role();
	                clientRole.setName(ERole.ROLE_CLIENT);
	                roleRepository.save(clientRole);
	            }
	            
	            if (roleRepository.findByName(ERole.ROLE_ADMIN).isEmpty()) {
	                Role adminRole = new Role();
	                adminRole.setName(ERole.ROLE_ADMIN);
	                roleRepository.save(adminRole);
	            }
	            
	            System.out.println("Roles initialized successfully!");
	        };
	    }
	

}
