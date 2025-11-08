package com.example.ktbapi.board;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Getter;

@Entity
@DiscriminatorValue("NOTICE")
@Getter
public class Notice extends Board {

    @Column(length = 20, nullable = false)
    private String noticeLevel;

    protected Notice() {}

    public Notice(String title, String content, String noticeLevel) {
        super(title, content);
        changeNoticeLevel(noticeLevel);
    }

    public void changeNoticeLevel(String level) {
        if (level == null || level.isBlank()) {
            throw new IllegalArgumentException("noticeLevel required");
        }
        this.noticeLevel = level;
    }

    public static Notice create(String title, String content, String noticeLevel) {
        return new Notice(title, content, noticeLevel);
    }
}

