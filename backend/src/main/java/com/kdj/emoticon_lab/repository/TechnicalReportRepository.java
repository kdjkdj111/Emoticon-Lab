package com.kdj.emoticon_lab.repository;

import com.kdj.emoticon_lab.domain.TechnicalReport;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface TechnicalReportRepository extends JpaRepository<TechnicalReport, Long> {
    Optional<TechnicalReport> findByProjectId(Long projectId);
    void deleteByProjectId(Long projectId);
}
