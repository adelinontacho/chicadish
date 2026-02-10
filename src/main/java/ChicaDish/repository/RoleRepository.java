package ChicaDish.repository;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import ChicaDish.enums.ERole;
import ChicaDish.model.Role;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
 Optional<Role> findByName(ERole name);
}
