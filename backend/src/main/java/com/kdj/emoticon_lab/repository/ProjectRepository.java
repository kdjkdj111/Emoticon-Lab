package com.kdj.emoticon_lab.repository;

import com.kdj.emoticon_lab.domain.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByUserIdOrderByCreatedAtDesc(UUID userId);
}
