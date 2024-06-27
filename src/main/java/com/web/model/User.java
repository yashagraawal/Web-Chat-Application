package com.web.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Data
@Getter
@Setter
@AllArgsConstructor
public class User {
    
	@Id
    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;
}
