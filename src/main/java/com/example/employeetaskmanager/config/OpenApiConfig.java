package com.example.employeetaskmanager.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI employeeTaskOpenAPI() {
        return new OpenAPI().info(new Info()
                .title("Employee Task Management API")
                .version("1.0")
                .description("REST API to manage employees, departments and tasks "
                        + "(Spring Boot, JPA, PostgreSQL)")
                .contact(new Contact().name("Abhishek Salunke").email("salunkeabhishek3033@gmail.com")));
    }
}