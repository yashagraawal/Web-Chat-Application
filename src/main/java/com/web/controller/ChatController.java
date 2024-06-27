package com.web.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.web.model.ChatMessage;
import com.web.service.UserService;

@RestController
public class ChatController {
	
	@Autowired
	private UserService userSer;
	
	@PostMapping("/api/login")
    public Map<String, Boolean> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");

        boolean isValid = userSer.validateCredentials(email, password);

        Map<String, Boolean> response = new HashMap<>();
        response.put("success", isValid);
        
        return response;
    }
	
	@PostMapping("/api/register")
    public Map<String, Boolean> register(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");
        String confpassword = credentials.get("confpassword");

        boolean isSuccess = userSer.RegisterUser(email, password, confpassword);

        Map<String, Boolean> response = new HashMap<>();
        response.put("success", isSuccess);
        
        return response;
    }

	@MessageMapping("/chat.sendMessage")
	@SendTo("/topic/public")
	public ChatMessage sendMessage(@Payload ChatMessage chatMessage) {
		return chatMessage;
	}

	@MessageMapping("/chat.addUser")
	@SendTo("/topic/public")
	public ChatMessage addUser(@Payload ChatMessage chatMessage, SimpMessageHeaderAccessor headerAccessor) {
		// Add username in web socket session
		headerAccessor.getSessionAttributes().put("username", chatMessage.getSender());
		return chatMessage;
	}
}
