package com.kdj.emoticon_lab.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectSummaryDto {
    private Long projectId;
    private String title;
    private String emoticonType;
    private String status;
    private LocalDateTime createdAt;
    private int totalImagesCount;
    private String thumbnailUrl;
}
