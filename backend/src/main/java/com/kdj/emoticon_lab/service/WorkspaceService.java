package com.kdj.emoticon_lab.service;

import com.kdj.emoticon_lab.domain.Project;
import com.kdj.emoticon_lab.domain.User;
import com.kdj.emoticon_lab.dto.ProjectSummaryDto;
import com.kdj.emoticon_lab.repository.ProjectRepository;
import com.kdj.emoticon_lab.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkspaceService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final com.kdj.emoticon_lab.repository.EmoticonImageRepository imageRepository;
    private final com.kdj.emoticon_lab.repository.AiReportRepository aiReportRepository;
    private final com.kdj.emoticon_lab.repository.TechnicalReportRepository technicalReportRepository;

    @Transactional(readOnly = true)
    public List<ProjectSummaryDto> getUserProjects(UUID userId) {
        List<Project> projects = projectRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return projects.stream().map(p -> {
            List<com.kdj.emoticon_lab.domain.EmoticonImage> images = imageRepository.findByProjectIdOrderBySlotIndexAsc(p.getId());
            String thumb = images.isEmpty() ? null : images.get(0).getSupabaseUrl();
            return ProjectSummaryDto.builder()
                .projectId(p.getId())
                .title(p.getTitle())
                .status(p.getStatus())
                .createdAt(p.getCreatedAt())
                .thumbnailUrl(thumb)
                .build();
        }).collect(Collectors.toList());
    }

    @Transactional
    public Project createProject(UUID userId, String title, List<String> imageUrls) {
        User user = userRepository.findById(userId)
                .orElseGet(() -> userRepository.save(User.builder().id(userId).email(userId.toString() + "@supabase.com").nickname("User").build()));

        Project project = Project.builder()
                .user(user)
                .title(title)
                .status("CREATED")
                .build();

        project = projectRepository.save(project);

        if (imageUrls != null) {
            for (int i = 0; i < imageUrls.size(); i++) {
                com.kdj.emoticon_lab.domain.EmoticonImage img = com.kdj.emoticon_lab.domain.EmoticonImage.builder()
                        .project(project)
                        .slotIndex(i + 1)
                        .supabaseUrl(imageUrls.get(i))
                        .build();
                imageRepository.save(img);
            }
        }

        return project;
    }

    @Transactional
    public Project updateProject(Long projectId, String title, String status) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));
        
        if (title != null) project.updateTitle(title);
        if (status != null) project.updateStatus(status);
        
        return projectRepository.save(project);
    }

    @Transactional
    public void deleteProject(Long projectId) {
        aiReportRepository.deleteByProjectId(projectId);
        technicalReportRepository.deleteByProjectId(projectId);
        imageRepository.deleteByProjectId(projectId);
        projectRepository.deleteById(projectId);
    }

    @Transactional(readOnly = true)
    public com.kdj.emoticon_lab.dto.ProjectDetailDto getProjectDetail(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));

        List<com.kdj.emoticon_lab.domain.EmoticonImage> images = imageRepository.findByProjectIdOrderBySlotIndexAsc(projectId);
        List<com.kdj.emoticon_lab.dto.ProjectDetailDto.ImageDto> imageDtos = images.stream().map(img -> 
                com.kdj.emoticon_lab.dto.ProjectDetailDto.ImageDto.builder()
                        .id(String.valueOf(img.getSlotIndex()))
                        .previewUrl(img.getSupabaseUrl())
                        .supabaseUrl(img.getSupabaseUrl())
                        .build()
        ).collect(Collectors.toList());

        java.util.Map<String, Object> aiReportMap = aiReportRepository.findByProjectId(projectId)
                .map(report -> {
                    java.util.Map<String, Object> map = new java.util.HashMap<>();
                    map.put("consistency", report.getConsistency());
                    map.put("emotion", report.getEmotion());
                    map.put("readability", report.getReadability());
                    map.put("vibe", report.getVibe());
                    map.put("risks", report.getRisks());
                    return map;
                })
                .orElse(null);

        java.util.Map<String, Object> techReportMap = technicalReportRepository.findByProjectId(projectId)
                .map(com.kdj.emoticon_lab.domain.TechnicalReport::getErrorDetails)
                .orElse(null);

        return com.kdj.emoticon_lab.dto.ProjectDetailDto.builder()
                .projectId(project.getId())
                .title(project.getTitle())
                .status(project.getStatus())
                .createdAt(project.getCreatedAt())
                .uploadedImages(imageDtos)
                .aiReport(aiReportMap)
                .technicalReport(techReportMap)
                .build();
    }
}
