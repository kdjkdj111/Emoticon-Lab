package com.kdj.emoticon_lab.service;

import com.kdj.emoticon_lab.domain.EmoticonImage;
import com.kdj.emoticon_lab.domain.Project;
import com.kdj.emoticon_lab.domain.TechnicalReport;
import com.kdj.emoticon_lab.dto.ValidationErrorDto;
import com.kdj.emoticon_lab.repository.EmoticonImageRepository;
import com.kdj.emoticon_lab.repository.ProjectRepository;
import com.kdj.emoticon_lab.repository.TechnicalReportRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.net.URL;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class TechnicalAnalysisService {

    private final ProjectRepository projectRepository;
    private final EmoticonImageRepository imageRepository;
    private final TechnicalReportRepository reportRepository;

    public TechnicalReport analyzeImages(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));
        
        List<EmoticonImage> images = imageRepository.findByProjectIdOrderBySlotIndexAsc(projectId);
        List<ValidationErrorDto> allErrors = new ArrayList<>();

        for (EmoticonImage img : images) {
            try {
                java.net.HttpURLConnection connection = (java.net.HttpURLConnection) new java.net.URL(img.getSupabaseUrl()).openConnection();
                connection.setRequestProperty("User-Agent", "Mozilla/5.0");
                try (java.io.InputStream is = connection.getInputStream()) {
                    byte[] imageBytes = is.readAllBytes();
                    
                    // 1. File Size Check (e.g., Warn if > 2MB)
                    if (imageBytes.length > 2 * 1024 * 1024) {
                        allErrors.add(new ValidationErrorDto(img.getSlotIndex(), "format", "용량 초과 (2MB 이상)", null));
                    }
                    
                    // 2. Format Check (PNG magic bytes)
                    if (imageBytes.length < 8 || 
                        imageBytes[0] != (byte) 137 || imageBytes[1] != (byte) 80 || 
                        imageBytes[2] != (byte) 78 || imageBytes[3] != (byte) 71) {
                        allErrors.add(new ValidationErrorDto(img.getSlotIndex(), "format", "PNG 포맷이 아닙니다 (권장: PNG)", null));
                    }

                    java.io.ByteArrayInputStream bais = new java.io.ByteArrayInputStream(imageBytes);
                    BufferedImage image = ImageIO.read(bais);
                    if (image != null) {
                        analyzeSingleImage(image, img.getSlotIndex(), allErrors);
                    }
                }
            } catch (IOException e) {
                log.error("Failed to read image for slot {}", img.getSlotIndex(), e);
            }
        }

        // Save report
        Map<String, Object> errorDetails = new HashMap<>();
        errorDetails.put("errors", allErrors);

        TechnicalReport report = TechnicalReport.builder()
                .project(project)
                .errorDetails(errorDetails)
                .build();
        
        String currentStatus = project.getStatus();
        if ("AI_COMPLETED".equals(currentStatus)) {
            project.updateStatus("ALL_COMPLETED");
        } else if (!"ALL_COMPLETED".equals(currentStatus)) {
            project.updateStatus("TECHNICAL_COMPLETED");
        }
        
        projectRepository.save(project);
        return reportRepository.save(report);
    }

    private void analyzeSingleImage(BufferedImage image, int slot, List<ValidationErrorDto> errors) {
        checkDimensions(image, slot, 360, 360, errors);
        checkMarginViolation(image, slot, 10, errors);
        checkStrayPixels(image, slot, 15, errors);
    }

    private void checkDimensions(BufferedImage image, int slot, int targetW, int targetH, List<ValidationErrorDto> errors) {
        if (image.getWidth() != targetW || image.getHeight() != targetH) {
            errors.add(new ValidationErrorDto(slot, "size", 
                String.format("규격 오류: %dx%d (권장 %dx%d)", image.getWidth(), image.getHeight(), targetW, targetH), null));
        }
    }

    private void checkMarginViolation(BufferedImage image, int slot, int margin, List<ValidationErrorDto> errors) {
        int w = image.getWidth();
        int h = image.getHeight();

        for (int y = 0; y < h; y++) {
            for (int x = 0; x < w; x++) {
                if (x < margin || x >= w - margin || y < margin || y >= h - margin) {
                    int alpha = (image.getRGB(x, y) >> 24) & 0xff;
                    if (alpha > 0) {
                        Map<String, Integer> coords = new HashMap<>();
                        coords.put("x", x);
                        coords.put("y", y);
                        errors.add(new ValidationErrorDto(slot, "margin", "여백 침범 발견", coords));
                        return; // 1개만 찾아도 리턴 (최적화)
                    }
                }
            }
        }
    }

    private void checkStrayPixels(BufferedImage image, int slot, int minBlobSize, List<ValidationErrorDto> errors) {
        int w = image.getWidth();
        int h = image.getHeight();
        boolean[][] visited = new boolean[h][w];
        int strayCount = 0;

        for (int y = 0; y < h; y++) {
            for (int x = 0; x < w; x++) {
                int alpha = (image.getRGB(x, y) >> 24) & 0xff;
                if (alpha > 0 && !visited[y][x]) {
                    BlobInfo blob = bfsBlobSize(image, x, y, visited);
                    
                    if (blob.maxAlpha < 100) {
                        strayCount++;
                        if (strayCount <= 3) {
                            Map<String, Integer> coords = new HashMap<>();
                            coords.put("x", x);
                            coords.put("y", y);
                            errors.add(new ValidationErrorDto(slot, "pixel", "지우다 만 반투명 얼룩 발견", coords));
                        }
                    } else if (blob.size <= 3) {
                        strayCount++;
                        if (strayCount <= 3) {
                            Map<String, Integer> coords = new HashMap<>();
                            coords.put("x", x);
                            coords.put("y", y);
                            errors.add(new ValidationErrorDto(slot, "pixel", "미세한 점(노이즈) 발견", coords));
                        }
                    }
                }
            }
        }
    }

    private BlobInfo bfsBlobSize(BufferedImage image, int startX, int startY, boolean[][] visited) {
        int size = 0;
        int maxAlpha = 0;
        Queue<int[]> q = new LinkedList<>();
        q.add(new int[]{startX, startY});
        visited[startY][startX] = true;

        int[] dx = {-1, 1, 0, 0, -1, -1, 1, 1};
        int[] dy = {0, 0, -1, 1, -1, 1, -1, 1};

        while (!q.isEmpty()) {
            int[] curr = q.poll();
            size++;
            
            int alpha = (image.getRGB(curr[0], curr[1]) >> 24) & 0xff;
            if (alpha > maxAlpha) {
                maxAlpha = alpha;
            }

            for (int i = 0; i < 8; i++) {
                int nx = curr[0] + dx[i], ny = curr[1] + dy[i];
                if (nx >= 0 && nx < image.getWidth() && ny >= 0 && ny < image.getHeight() && !visited[ny][nx]) {
                    if (((image.getRGB(nx, ny) >> 24) & 0xff) > 0) {
                        visited[ny][nx] = true;
                        q.add(new int[]{nx, ny});
                    }
                }
            }
        }
        return new BlobInfo(size, maxAlpha);
    }
    
    private static class BlobInfo {
        int size;
        int maxAlpha;
        BlobInfo(int size, int maxAlpha) {
            this.size = size;
            this.maxAlpha = maxAlpha;
        }
    }
}
