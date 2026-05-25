package com.kdj.emoticon_lab.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectDetailDto {
    private Long projectId;
    private String title;
    private String emoticonType;
    private String status;
    private LocalDateTime createdAt;
    
    // 이미지 정보 (프론트엔드 형식: id, previewUrl, supabaseUrl)
    private List<ImageDto> uploadedImages;
    
    // 리포트 정보 (프론트엔드 형식의 JSON 객체)
    private Map<String, Object> technicalReport;
    private Map<String, Object> aiReport;

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ImageDto {
        private String id;
        private String previewUrl;
        private String supabaseUrl;
    }
}
