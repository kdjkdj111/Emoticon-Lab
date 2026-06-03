package com.kdj.emoticon_lab.controller;

import com.kdj.emoticon_lab.domain.AiReport;
import com.kdj.emoticon_lab.domain.TechnicalReport;
import com.kdj.emoticon_lab.service.AiAnalysisService;
import com.kdj.emoticon_lab.service.TechnicalAnalysisService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/analysis")
@RequiredArgsConstructor
public class AnalysisController {

    private final TechnicalAnalysisService technicalAnalysisService;
    private final AiAnalysisService aiAnalysisService;

    @PostMapping("/technical/{projectId}")
    public ResponseEntity<?> requestTechnicalAnalysis(@PathVariable Long projectId) {
        try {
            log.info("[기술 검수] 요청 수신 - projectId={}", projectId);
            TechnicalReport report = technicalAnalysisService.analyzeImages(projectId);
            log.info("[기술 검수] 완료 - projectId={}", projectId);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            log.error("[기술 검수] 처리 실패 - projectId={}, 원인={}", projectId, e.getMessage(), e);
            return ResponseEntity.internalServerError().body("기술 검수 처리 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    @PostMapping("/ai/{projectId}")
    public ResponseEntity<?> requestAiAnalysis(@PathVariable Long projectId, @RequestBody(required = false) AiAnalysisRequest req) {
        try {
            log.info("[AI 분석] 요청 수신 - projectId={}, 요청정보={}", projectId, req);
            AiReport report = aiAnalysisService.analyzeWithGemini(projectId, req);
            log.info("[AI 분석] 완료 - projectId={}", projectId);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            log.error("[AI 분석] 처리 실패 - projectId={}, 원인={}", projectId, e.getMessage(), e);
            return ResponseEntity.internalServerError().body("AI 분석 처리 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    @lombok.Data
    public static class AiAnalysisRequest {
        private String ageGroup;
        private String type;
        private String description;
    }
}
