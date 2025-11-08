package com.example.ktbapi.board;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.Rollback;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
class BoardInheritanceTest {

    @PersistenceContext
    EntityManager em;

    @Test
    @Rollback(false)
    void joined_inheritance_save_and_load() {
        Notice notice = Notice.create("공지 제목", "공지 내용", "긴급");
        Free free = Free.create("자유 제목", "자유 내용", "잡담");
        Qna qna = Qna.create("질문 제목", "질문 내용");

        em.persist(notice);
        em.persist(free);
        em.persist(qna);
        em.flush();
        em.clear();

        Notice n = em.find(Notice.class, notice.getId());
        Free f = em.find(Free.class, free.getId());
        Qna q = em.find(Qna.class, qna.getId());

        assertThat(n.getNoticeLevel()).isEqualTo("긴급");
        assertThat(f.getCategory()).isEqualTo("잡담");
        assertThat(q.isSolved()).isFalse();

        assertThat(n.getTitle()).isEqualTo("공지 제목");
        assertThat(f.getTitle()).isEqualTo("자유 제목");
        assertThat(q.getContent()).isEqualTo("질문 내용");
    }
}