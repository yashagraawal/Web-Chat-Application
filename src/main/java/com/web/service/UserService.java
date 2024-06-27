package com.web.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.web.model.User;
import com.web.repository.UserRepository;

@Service
public class UserService {
	
	@Autowired
	private UserRepository userRepo;
	
	public boolean validateCredentials(String email,String Password) {
		
		try {
			Optional<User> existingUser = userRepo.findById(email);
			
			if(existingUser.isPresent()) {
				User curr = existingUser.get();
				if(email.equals(curr.getEmail()) && Password.equals(curr.getPassword())) {
					return true;
				}else {
					return false;
				}
			}else {
				return false;
			}
		}catch(Exception e) {
			
			return false;
		}
	}
	
	public boolean RegisterUser(String email, String password, String confpassword) {
		try {
			Optional<User> existingUser = userRepo.findById(email);
			
			if(!password.equals(confpassword)) {
				return false;
			}
			
			if(!existingUser.isPresent()) {
				User curr = new User(email, password);
				
				userRepo.save(curr);
				
				return true;
			}else {
				return false;
			}
			
		}catch(Exception e) {
			return false;
		}
	}
}
