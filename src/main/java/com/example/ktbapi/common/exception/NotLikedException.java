package com.example.ktbapi.common.exception;


public class NotLikedException extends RuntimeException {
    public NotLikedException() {
        super("not_liked");
    }

    public NotLikedException(String message) {
        super(message);
    }
}
