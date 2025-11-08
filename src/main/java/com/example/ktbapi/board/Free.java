package com.example.ktbapi.board;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Getter;

@Entity
@DiscriminatorValue("FREE")
@Getter
public class Free extends Board {

    @Column(length = 50)
    private String category;

    protected Free() {}

    public Free(String title, String content, String category) {
        super(title, content);
        changeCategory(category);
    }

    public void changeCategory(String category) {
        if (category == null || category.isBlank()) {
            throw new IllegalArgumentException("category required");
        }
        this.category = category;
    }

    public static Free create(String title, String content, String category) {
        return new Free(title, content, category);
    }
}
