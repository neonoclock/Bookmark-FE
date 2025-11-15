package com.example.ktbapi.common.exception;


public class CommentNotFoundException extends NotFoundException {
    public CommentNotFoundException(Long id) {
        super("comment_not_found (id=" + id + ")");
    }

    public CommentNotFoundException() {
        super("comment_not_found");
    }
}
