package com.example.ktbapi.common;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI apiInfo() {
        return new OpenAPI()
                .info(new Info()
                        .title("책갈피 API 문서")
                        .description("독서 커뮤니티 서비스 API")
                        .version("1.0.0"));
    }

    @Bean
    public GroupedOpenApi postsApi() {
        return GroupedOpenApi.builder()
                .group("posts-controller")
                .packagesToScan("com.example.ktbapi.post.api")
                .pathsToMatch("/api/v1/posts", "/api/v1/posts/**")
                .pathsToExclude(
                        "/api/v1/posts/*/comments/**",
                        "/api/v1/posts/*/like" 
                )
                .build();
    }

    @Bean
    public GroupedOpenApi commentsApi() {
        return GroupedOpenApi.builder()
                .group("comments-controller")
                .packagesToScan("com.example.ktbapi.post.api")
                .pathsToMatch(
                        "/api/v1/posts/*/comments",
                        "/api/v1/posts/*/comments/**"
                )
                .build();
    }

    @Bean
    public GroupedOpenApi likesApi() {
        return GroupedOpenApi.builder()
                .group("post-like-controller")
                .packagesToScan("com.example.ktbapi.post.api")
                .pathsToMatch("/api/v1/posts/*/like")
                .build();
    }
    @Bean
    public GroupedOpenApi querydslApi() {
        return GroupedOpenApi.builder()
                .group("post-querydsl-controller")
                .pathsToMatch("/api/querydsl/**")
                .build();
    }


    @Bean
    public GroupedOpenApi usersApi() {
        return GroupedOpenApi.builder()
                .group("users")
                .packagesToScan("com.example.ktbapi.user.api")
                .pathsToMatch("/api/v1/users", "/api/v1/users/**")
                .build();
    }
}
