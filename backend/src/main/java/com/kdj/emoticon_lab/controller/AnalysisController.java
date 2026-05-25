package com.kdj.emoticon_lab.controller;

import com.kdj.emoticon_lab.domain.AiReport;
import com.kdj.emoticon_lab.domain.TechnicalReport;
import com.kdj.emoticon_lab.service.AiAnalysisService;
import com.kdj.emoticon_lab.service.TechnicalAnalysisService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analysis")
@RequiredArgsConstructor
public class AnalysisController {

    private final TechnicalAnalysisService technicalAnalysisService;
    private final AiAnalysisService aiAnalysisService;

    @PostMapping("/technical/{projectId}")
    public ResponseEntity<TechnicalReport> requestTechnicalAnalysis(@PathVariable Long projectId) {
        TechnicalReport report = technicalAnalysisService.analyzeImages(projectId);
        return ResponseEntity.ok(report);
    }

    @PostMapping("/ai/{projectId}")
    public ResponseEntity<AiReport> requestAiAnalysis(@PathVariable Long projectId) {
        AiReport report = aiAnalysisService.analyzeWithGemini(projectId);
        return ResponseEntity.ok(report);
    }
}
