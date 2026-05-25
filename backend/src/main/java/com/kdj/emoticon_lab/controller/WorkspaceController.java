package com.kdj.emoticon_lab.controller;

import com.kdj.emoticon_lab.domain.Project;
import com.kdj.emoticon_lab.dto.ProjectSummaryDto;
import com.kdj.emoticon_lab.service.WorkspaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class WorkspaceController {

    private final WorkspaceService workspaceService;

    @GetMapping("/{userId}")
    public ResponseEntity<List<ProjectSummaryDto>> getUserProjects(@PathVariable UUID userId) {
        return ResponseEntity.ok(workspaceService.getUserProjects(userId));
    }

    @GetMapping("/detail/{projectId}")
    public ResponseEntity<com.kdj.emoticon_lab.dto.ProjectDetailDto> getProjectDetail(@PathVariable Long projectId) {
        return ResponseEntity.ok(workspaceService.getProjectDetail(projectId));
    }

    @PostMapping("/{userId}")
    public ResponseEntity<Project> createProject(@PathVariable UUID userId, @RequestBody ProjectCreateRequest req) {
        return ResponseEntity.ok(workspaceService.createProject(userId, req.getTitle(), req.getImageUrls()));
    }

    @lombok.Data
    static class ProjectCreateRequest {
        private String title;
        private List<String> imageUrls;
    }
}
