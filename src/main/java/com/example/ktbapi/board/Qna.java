package com.example.ktbapi.board;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Getter;

@Entity
@DiscriminatorValue("QNA")
@Getter
public class Qna extends Board {

    @Column(nullable = false)
    private boolean solved;

    protected Qna() {}

    public Qna(String title, String content) {
        super(title, content);
        this.solved = false;
    }

    public void markSolved() {
        this.solved = true;
    }

    public void markUnsolved() {
        this.solved = false;
    }

    public static Qna create(String title, String content) {
        return new Qna(title, content);
    }
}
