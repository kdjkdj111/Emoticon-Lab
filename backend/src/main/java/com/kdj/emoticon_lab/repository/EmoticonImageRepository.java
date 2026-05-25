package com.kdj.emoticon_lab.repository;

import com.kdj.emoticon_lab.domain.EmoticonImage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EmoticonImageRepository extends JpaRepository<EmoticonImage, Long> {
    List<EmoticonImage> findByProjectIdOrderBySlotIndexAsc(Long projectId);
}
