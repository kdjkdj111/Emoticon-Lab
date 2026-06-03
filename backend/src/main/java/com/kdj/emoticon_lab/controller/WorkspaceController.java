package com.kdj.emoticon_lab.controller;

import com.kdj.emoticon_lab.domain.Project;
import com.kdj.emoticon_lab.dto.ProjectSummaryDto;
import com.kdj.emoticon_lab.service.WorkspaceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class WorkspaceController {

    private final WorkspaceService workspaceService;

    @GetMapping("/{userId}")
    public ResponseEntity<?> getUserProjects(@PathVariable UUID userId) {
        try {
            log.info("[프로젝트] 목록 조회 요청 - userId={}", userId);
            List<ProjectSummaryDto> result = workspaceService.getUserProjects(userId);
            log.info("[프로젝트] 목록 조회 완료 - userId={}, 건수={}", userId, result.size());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("[프로젝트] 목록 조회 실패 - userId={}, 원인={}", userId, e.getMessage(), e);
            return ResponseEntity.internalServerError().body("프로젝트 목록 조회 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    @GetMapping("/detail/{projectId}")
    public ResponseEntity<?> getProjectDetail(@PathVariable Long projectId) {
        try {
            log.info("[프로젝트] 상세 조회 요청 - projectId={}", projectId);
            var result = workspaceService.getProjectDetail(projectId);
            log.info("[프로젝트] 상세 조회 완료 - projectId={}", projectId);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            log.warn("[프로젝트] 상세 조회 - 존재하지 않는 프로젝트 - projectId={}, 원인={}", projectId, e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("[프로젝트] 상세 조회 실패 - projectId={}, 원인={}", projectId, e.getMessage(), e);
            return ResponseEntity.internalServerError().body("프로젝트 상세 조회 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    @PostMapping("/{userId}")
    public ResponseEntity<?> createProject(@PathVariable UUID userId, @RequestBody ProjectCreateRequest req) {
        try {
            log.info("[프로젝트] 생성 요청 - userId={}, title={}, 이미지수={}", userId, req.getTitle(), req.getImageUrls() != null ? req.getImageUrls().size() : 0);
            Project result = workspaceService.createProject(userId, req.getTitle(), req.getImageUrls());
            log.info("[프로젝트] 생성 완료 - userId={}, projectId={}", userId, result.getId());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("[프로젝트] 생성 실패 - userId={}, 원인={}", userId, e.getMessage(), e);
            return ResponseEntity.internalServerError().body("프로젝트 생성 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    @PutMapping("/{projectId}")
    public ResponseEntity<?> updateProject(@PathVariable Long projectId, @RequestBody ProjectUpdateRequest req) {
        try {
            log.info("[프로젝트] 수정 요청 - projectId={}, title={}, status={}", projectId, req.getTitle(), req.getStatus());
            Project result = workspaceService.updateProject(projectId, req.getTitle(), req.getStatus());
            log.info("[프로젝트] 수정 완료 - projectId={}", projectId);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            log.warn("[프로젝트] 수정 - 존재하지 않는 프로젝트 - projectId={}, 원인={}", projectId, e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("[프로젝트] 수정 실패 - projectId={}, 원인={}", projectId, e.getMessage(), e);
            return ResponseEntity.internalServerError().body("프로젝트 수정 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    @DeleteMapping("/{projectId}")
    public ResponseEntity<?> deleteProject(@PathVariable Long projectId) {
        try {
            log.info("[프로젝트] 삭제 요청 - projectId={}", projectId);
            workspaceService.deleteProject(projectId);
            log.info("[프로젝트] 삭제 완료 - projectId={}", projectId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            log.error("[프로젝트] 삭제 실패 - projectId={}, 원인={}", projectId, e.getMessage(), e);
            return ResponseEntity.internalServerError().body("프로젝트 삭제 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    @lombok.Data
    public static class ProjectUpdateRequest {
        private String title;
        private String status;
    }

    @lombok.Data
    static class ProjectCreateRequest {
        private String title;
        private List<String> imageUrls;
    }
}
