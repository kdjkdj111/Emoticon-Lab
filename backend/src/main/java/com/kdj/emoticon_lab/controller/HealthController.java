package com.kdj.emoticon_lab.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * HealthController - 서버 생존 확인용 컨트롤러
 *
 * [목적]
 * Render 무료 플랜은 15분 동안 요청이 없으면 서버가 절전 모드(Spin down)로 진입합니다.
 * 이후 첫 요청 시 Cold Start로 인해 약 1~2분의 지연이 발생합니다.
 * 이를 방지하기 위해 UptimeRobot(https://uptimerobot.com) 같은 외부 무료 모니터링 서비스가
 * 14분마다 이 엔드포인트를 호출하여 서버를 계속 활성 상태로 유지합니다.
 *
 * [안전성]
 * - DB 조회나 외부 API 호출이 전혀 없으므로 서버에 부하를 주지 않습니다.
 * - 인증 없이 접근 가능하지만, "OK" 문자열만 반환하므로 보안상 문제가 없습니다.
 * - 기존 API(/api/projects/**, /api/analysis/**)와 독립적으로 동작합니다.
 */
@RestController
public class HealthController {

    /**
     * GET /api/health
     *
     * 서버가 살아있으면 HTTP 200 OK와 함께 "OK" 문자열을 반환합니다.
     * UptimeRobot은 200 응답을 받으면 서버가 정상 동작 중임을 확인합니다.
     *
     * @return HTTP 200 OK, body: "OK"
     */
    @GetMapping("/api/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("OK");
    }
}
