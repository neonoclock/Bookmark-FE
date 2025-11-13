package com.example.ktbapi.post.api;

import com.example.ktbapi.common.ApiResponse;
import com.example.ktbapi.common.dto.IdResponse;
import com.example.ktbapi.common.paging.PagedResponse;
import com.example.ktbapi.post.dto.*;
import com.example.ktbapi.post.service.PostService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://172.16.24.172:5500")
@RestController
@RequestMapping("/api/v1/posts")
public class PostController {

    private final PostService service;

    public PostController(PostService service) {
        this.service = service;
    }

    @GetMapping
    public ApiResponse<PagedResponse<PostSummaryResponse>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(defaultValue = "DATE") PostSortKey sort
    ) {
        return ApiResponse.success(service.getPosts(page, limit, sort));
    }

    @GetMapping("/{postId}")
    public ApiResponse<PostDetailResponse> getPostDetail(
            @PathVariable Long postId,
            @RequestParam(required = false) Long viewerId
    ) {
        return ApiResponse.success(service.getPostDetail(postId, viewerId));
    }

    @PostMapping
    public ApiResponse<IdResponse> createPost(
            @RequestParam Long userId,
            @RequestBody PostCreateRequest req
    ) {
        return ApiResponse.success(service.createPost(userId, req));
    }

    @PatchMapping("/{postId}")
    public ApiResponse<PostUpdatedResponse> updatePost(
            @RequestParam Long userId,
            @PathVariable Long postId,
            @RequestBody PostUpdateRequest req
    ) {
        return ApiResponse.success(service.updatePost(userId, postId, req));
    }

    @DeleteMapping("/{postId}")
    public ApiResponse<Void> deletePost(
            @RequestParam Long userId,
            @PathVariable Long postId
    ) {
        service.deletePost(userId, postId);
        return ApiResponse.success();
    }

    @GetMapping("/nplus-one")
    public ApiResponse<List<PostSummaryResponse>> allWithNPlusOne() {
        return ApiResponse.success(service.getAllPosts_NPlusOne());
    }

    @GetMapping("/entity-graph")
    public ApiResponse<List<PostSummaryResponse>> allWithEntityGraph() {
        return ApiResponse.success(service.getAllPosts_EntityGraph());
    }
}

