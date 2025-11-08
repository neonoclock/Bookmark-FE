package com.example.ktbapi.board;

import jakarta.persistence.*;
import lombok.Getter;

@Entity
@Inheritance(strategy = InheritanceType.JOINED)
@DiscriminatorColumn(name = "board_type")
@Getter
public abstract class Board {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(nullable = false, length = 500)
    private String content;

    protected Board() {}

    protected Board(String title, String content) {
        changeTitle(title);
        changeContent(content);
    }

    public void changeTitle(String newTitle) {
        if (newTitle == null || newTitle.isBlank()) {
            throw new IllegalArgumentException("title required");
        }
        this.title = newTitle;
    }

    public void changeContent(String newContent) {
        if (newContent == null || newContent.isBlank()) {
            throw new IllegalArgumentException("content required");
        }
        this.content = newContent;
    }

    public void updateDetails(String newTitle, String newContent) {
        if (newTitle != null && !newTitle.isBlank()) this.title = newTitle;
        if (newContent != null && !newContent.isBlank()) this.content = newContent;
    }
}
