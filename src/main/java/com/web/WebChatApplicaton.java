package com.web;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.PropertySource;

@SpringBootApplication
//@PropertySource("file:D://yashagraawal//github//Config//application.properties")
public class WebChatApplicaton {

	public static void main(String[] args) {
		SpringApplication.run(WebChatApplicaton.class, args);
	}

}
