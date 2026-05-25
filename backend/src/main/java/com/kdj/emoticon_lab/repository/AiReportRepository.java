package com.kdj.emoticon_lab.repository;

import com.kdj.emoticon_lab.domain.AiReport;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface AiReportRepository extends JpaRepository<AiReport, Long> {
    Optional<AiReport> findByProjectId(Long projectId);
}
