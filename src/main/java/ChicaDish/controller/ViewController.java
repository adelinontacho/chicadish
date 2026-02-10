package ChicaDish.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ViewController {

	@GetMapping("/")
	public String index() {
		
		return "index";
	}
	
	@GetMapping("/admin/page")
	public String adminPage() {
		
		return "admin";
	}
	
	
}
