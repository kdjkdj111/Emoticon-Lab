package com.kdj.emoticon_lab.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.kdj.emoticon_lab.domain.AiReport;
import com.kdj.emoticon_lab.domain.EmoticonImage;
import com.kdj.emoticon_lab.domain.Project;
import com.kdj.emoticon_lab.repository.AiReportRepository;
import com.kdj.emoticon_lab.repository.EmoticonImageRepository;
import com.kdj.emoticon_lab.repository.ProjectRepository;
import com.kdj.emoticon_lab.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiAnalysisService {

    private final ProjectRepository projectRepository;
    private final EmoticonImageRepository imageRepository;
    private final AiReportRepository aiReportRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    @Value("${gemini.api.url}")
    private String geminiApiUrl;

    public AiReport analyzeWithGemini(Long projectId, com.kdj.emoticon_lab.controller.AnalysisController.AiAnalysisRequest req) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));

        List<EmoticonImage> images = imageRepository.findByProjectIdOrderBySlotIndexAsc(projectId);
        
        // 1. Download images and encode to Base64
        List<Map<String, Object>> parts = new java.util.ArrayList<>();
        
        String userContext = "";
        if (req != null) {
            String translatedType = "멈춰있는 이모티콘";
            if ("animated".equals(req.getType())) translatedType = "움직이는 이모티콘";
            else if ("big".equals(req.getType())) translatedType = "큰 이모티콘";
            
            userContext = "[제작자의 기획 의도]\n" +
                          "- 타겟 연령층: " + req.getAgeGroup() + "\n" +
                          "- 이모티콘 종류: " + translatedType + "\n" +
                          "- 부가 설명: " + req.getDescription() + "\n\n" +
                          "심사위원님, 위 기획 의도를 바탕으로 타겟층의 공감대와 상품성(vibe, emotion)을 중점적으로 심사해 주세요.\n\n";
        }

        String prompt = userContext + """
                당신은 카카오톡 이모티콘 스튜디오의 매우 엄격한 수석 심사위원입니다.
                실제 카카오톡 이모티콘 승인율은 매우 낮으며, 심사 기준은 까다롭습니다.
                제공된 이모티콘 이미지(최대 32장)들을 매의 눈으로 분석하여 다음 5가지 지표를 아주 냉정하고 비판적으로 평가하세요.
                
                [심사 기준]
                1. consistency (캐릭터 일관성): 캐릭터의 비율, 선 굵기, 색상, 이목구비 위치가 모든 이미지에서 정확히 일치하는지 평가. 조금이라도 붕괴되거나 어색하면 점수를 대폭 깎으세요.
                2. emotion (감정 및 메시지 활용성): 일상 카톡 대화에서 자주 쓰일 만한 범용적이고 실용적인 감정 표현인가? 억지스럽거나 너무 특수한 상황이라 자주 안 쓰일 것 같으면 매섭게 비판하세요.
                3. readability (시인성): 스마트폰 작은 화면, 그리고 '라이트 모드'와 '다크 모드' 양쪽에서 글귀나 표정이 뚜렷하게 잘 보이는지 평가. 가독성이 떨어지는 색상이나 작은 글씨를 찾아내어 경고하세요.
                4. vibe (상품성 및 엣지): 기존 수많은 이모티콘과 차별화되는 매력, 확실한 타겟층(10대, 직장인 등), 밈(meme) 활용도를 평가. 흔하고 식상한 컨셉이면 매력도를 낮게 평가하세요.
                5. risks (윤리 및 반려 위험): 저작권 침해 우려, 과도한 폭력성/선정성, 욕설/비속어 연상, 특정 계층 혐오 조장 요소가 1%라도 있다면 무조건 'danger' 처리하세요.
                
                결과는 반드시 아래의 순수 JSON 형식으로만 반환하세요. 마크다운(` ```json ` 등)이나 부가 설명은 절대 포함하지 마세요.
                
                {
                  "consistency": { "score": 0~100 (정수), "note": "비판적이고 예리한 평가 코멘트" },
                  "emotion": {
                    "scores": {
                      "joy": 0~100 (정수),
                      "greeting": 0~100 (정수),
                      "sadness": 0~100 (정수),
                      "anger": 0~100 (정수),
                      "daily": 0~100 (정수)
                    },
                    "note": "활용성에 대한 냉정한 평가"
                  },
                  "readability": { "warnings": ["시인성 문제가 있는 부분 구체적 지적"], "passNote": "전반적 시인성 평가" },
                  "vibe": { "tags": ["#타겟층", "#컨셉키워드"], "matchRate": 0~100 (정수) },
                  "risks": {
                    "status": "safe" | "caution" | "danger",
                    "statusText": "안전" | "주의요망" | "반려위험",
                    "items": [
                      {"id": 1, "type": "safe" | "danger", "text": "위해요소에 대한 상세 설명"}
                    ]
                  }
                }
                """;
                
        parts.add(Map.of("text", prompt));

        for (EmoticonImage img : images) {
            try {
                java.net.HttpURLConnection connection = (java.net.HttpURLConnection) new java.net.URL(img.getSupabaseUrl()).openConnection();
                connection.setRequestProperty("User-Agent", "Mozilla/5.0");
                try (java.io.InputStream is = connection.getInputStream()) {
                    byte[] imageBytes = is.readAllBytes();
                    String base64Image = java.util.Base64.getEncoder().encodeToString(imageBytes);
                    
                    Map<String, String> inlineData = new HashMap<>();
                    inlineData.put("mimeType", "image/png");
                    inlineData.put("data", base64Image);
                    
                    parts.add(Map.of("inlineData", inlineData));
                }
            } catch (Exception e) {
                log.warn("Failed to download or encode image at slot: {}", img.getSlotIndex(), e);
            }
        }

        if (parts.size() == 1) {
            throw new RuntimeException("분석할 유효한 이미지가 없습니다.");
        }

        // 2. Build Payload
        Map<String, Object> content = Map.of("parts", parts);
        Map<String, Object> requestBody = Map.of("contents", List.of(content));

        // 3. Call Gemini API
        WebClient webClient = WebClient.builder().build();
        String responseJson;
        try {
            log.info("[AI 분석] Gemini API 요청 시작 - projectId={}, 이미지파트수={}", projectId, parts.size() - 1);
            responseJson = webClient.post()
                    .uri(geminiApiUrl + "?key=" + geminiApiKey)
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .bodyValue(requestBody)
                    .retrieve()
                    .onStatus(status -> status.is4xxClientError() || status.is5xxServerError(), clientResponse ->
                        clientResponse.bodyToMono(String.class).map(body -> {
                            log.error("[AI 분석] Gemini API 오류 응답 - HTTP={}, body={}", clientResponse.statusCode().value(), body);
                            return new RuntimeException("Gemini API 오류 [" + clientResponse.statusCode().value() + "]: " + body);
                        })
                    )
                    .bodyToMono(String.class)
                    .block();
            log.info("[AI 분석] Gemini API 응답 수신 성공 - projectId={}", projectId);
        } catch (Exception e) {
            log.error("[AI 분석] Gemini API 호출 실패 - projectId={}, 원인={}", projectId, e.getMessage(), e);
            throw new RuntimeException("AI API 요청에 실패했습니다.", e);
        }

        // 4. Parse Gemini Response wrapper
        String extractedJsonText = "";
        try {
            Map<String, Object> geminiResponse = objectMapper.readValue(responseJson, new TypeReference<Map<String, Object>>() {});
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) geminiResponse.get("candidates");
            Map<String, Object> firstCandidate = candidates.get(0);
            Map<String, Object> candidateContent = (Map<String, Object>) firstCandidate.get("content");
            List<Map<String, Object>> candidateParts = (List<Map<String, Object>>) candidateContent.get("parts");
            extractedJsonText = (String) candidateParts.get(0).get("text");
            
            // Clean up Markdown backticks if any
            extractedJsonText = extractedJsonText.trim();
            if (extractedJsonText.startsWith("```json")) {
                extractedJsonText = extractedJsonText.substring(7);
            } else if (extractedJsonText.startsWith("```")) {
                extractedJsonText = extractedJsonText.substring(3);
            }
            if (extractedJsonText.endsWith("```")) {
                extractedJsonText = extractedJsonText.substring(0, extractedJsonText.length() - 3);
            }
            extractedJsonText = extractedJsonText.trim();
            
        } catch (Exception e) {
            log.error("Failed to parse Gemini outer wrapper. Raw response: {}", responseJson, e);
            throw new RuntimeException("AI 응답 구조를 파싱할 수 없습니다.", e);
        }

        // 5. Parse our exact JSON and save
        try {
            Map<String, Object> parsedResponse = objectMapper.readValue(extractedJsonText, new TypeReference<Map<String, Object>>() {});
            
            AiReport report = AiReport.builder()
                    .project(project)
                    .consistency((Map<String, Object>) parsedResponse.get("consistency"))
                    .emotion((Map<String, Object>) parsedResponse.get("emotion"))
                    .readability((Map<String, Object>) parsedResponse.get("readability"))
                    .vibe((Map<String, Object>) parsedResponse.get("vibe"))
                    .risks((Map<String, Object>) parsedResponse.get("risks"))
                    .build();
            
            String currentStatus = project.getStatus();
            if ("TECHNICAL_COMPLETED".equals(currentStatus)) {
                project.updateStatus("ALL_COMPLETED");
            } else if (!"ALL_COMPLETED".equals(currentStatus)) {
                project.updateStatus("AI_COMPLETED");
            }
            projectRepository.save(project);
            
            com.kdj.emoticon_lab.domain.User user = project.getUser();
            user.incrementApiUsage();
            userRepository.save(user);
            
            return aiReportRepository.save(report);
            
        } catch (Exception e) {
            log.error("Failed to parse inner JSON: {}", extractedJsonText, e);
            throw new RuntimeException("AI 응답이 올바른 JSON 형식이 아닙니다.", e);
        }
    }
}
