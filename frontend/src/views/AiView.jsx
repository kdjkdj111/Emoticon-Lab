/**
 * @file AiView.jsx
 * @description LLM(Gemini API 등)을 활용하여 이모티콘의 디자인 일관성, 감정 스펙트럼, 가독성 등을 종합 분석하는 리포트 컴포넌트
 * @props {Object} reportData - 이전에 완료된 AI 분석 결과 및 폼 입력 데이터 (API 중복 호출 방지 및 탭 전환 시 상태 유지용)
 * @props {Function} onSaveReport - 분석 완료 시 프롬프트 컨텍스트(FormData)와 결과 데이터를 전역 상태에 캐싱하는 콜백 함수
 */

import React, { useState } from 'react';
import './AiView.css';
// TODO: 실제 API 연동 시 제거될 Mock 데이터
import { mockAiReport } from '../mocks/mockData';
import logoImage from "../assets/Logo.png";

// ==========================================
// [1] Helper Components (차트 UI)
// ==========================================

/**
 * @component DonutChart
 * @description SVG를 활용한 점수 시각화용 원형 도넛 차트
 * @param {number} score - 0~100 사이의 분석 점수
 * @param {number} size - 차트의 전체 컨테이너 및 SVG 크기 (px)
 * @param {number} strokeWidth - 차트 선 두께
 */
const DonutChart = ({ score, size = 200, strokeWidth = 20 }) => {
    const radius = size / 2;
    const stroke = strokeWidth;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
        <div className="donut-chart-wrapper" style={{ width: size, height: size, margin: '0 auto' }}>
            <svg height={size} width={size}>
                <circle stroke="#F1F3F5" fill="transparent" strokeWidth={stroke} r={normalizedRadius} cx={radius} cy={radius} />
                <circle
                    stroke="#191919" fill="transparent" strokeWidth={stroke}
                    strokeDasharray={circumference + ' ' + circumference}
                    style={{ strokeDashoffset }} strokeLinecap="round"
                    r={normalizedRadius} cx={radius} cy={radius}
                />
            </svg>
            <div className="donut-text">
                <span className="score" style={{ fontSize: `${size * 0.10}px` }}>{score}</span>
                <span className="label" style={{ fontSize: `${size * 0.08}px`, marginTop: '4px' }}>SCORE</span>
            </div>
        </div>
    );
};

/**
 * @component RadarChartMock
 * @description 5가지 감정 지표를 보여주는 레이더(방사형) 차트 UI
 * TODO: 실제 데이터 연동 시 Recharts 등의 라이브러리 교체 또는 동적 SVG 폴리곤 렌더링 구현 필요
 */
const RadarChartMock = () => (
    <div className="radar-chart-wrapper" style={{ display: 'flex', justifyContent: 'center' }}>
        <svg viewBox="0 0 200 200" width="100%" height="160" style={{ maxWidth: '200px' }}>
            <polygon points="100,20 180,80 150,170 50,170 20,80" fill="none" stroke="#EEE" strokeWidth="1" />
            <polygon points="100,50 150,85 130,140 70,140 50,85" fill="none" stroke="#EEE" strokeWidth="1" />
            <polygon points="100,40 160,90 140,150 70,160 40,80" fill="rgba(254, 229, 0, 0.5)" stroke="#FEE500" strokeWidth="2" />
            <text x="100" y="15" textAnchor="middle" fontSize="10" fontWeight="700">기쁨</text>
            <text x="190" y="85" textAnchor="start" fontSize="10" fontWeight="700">인사</text>
            <text x="160" y="185" textAnchor="middle" fontSize="10" fontWeight="700">슬픔</text>
            <text x="40" y="185" textAnchor="middle" fontSize="10" fontWeight="700">분노</text>
            <text x="10" y="85" textAnchor="end" fontSize="10" fontWeight="700">일상</text>
        </svg>
    </div>
);

// ==========================================
// [2] Main Component
// ==========================================

const AiView = ({ reportData, onSaveReport }) => {

    // ==========================================
    // [2-1] State: 진행 상태 및 데이터 관리
    // ==========================================
    // 전역 캐싱된 결과가 존재하면 불필요한 API 호출을 막기 위해 바로 'completed' 뷰로 진입
    const [aiStatus, setAiStatus] = useState(reportData ? 'completed' : 'ready');

    // LLM 프롬프트에 제공할 컨텍스트 데이터 (이전에 입력한 내역이 있다면 복원)
    const [aiFormData, setAiFormData] = useState(reportData?.formData || {
        ageGroup: '20~30대',
        type: 'static',
        description: ''
    });

    // ==========================================
    // [2-2] Handlers
    // ==========================================

    /**
     * @handler handleRequestAI
     * @description AI 분석 요청 로직. 입력된 컨텍스트(FormData)를 기반으로 백엔드(LLM API)와 통신.
     */
    const handleRequestAI = () => {
        setAiStatus('analyzing');

        // TODO: 실제 환경에서는 axios 통신 로직으로 대체
        setTimeout(() => {
            setAiStatus('completed');

            // 토큰(비용) 절약 및 상태 유지를 위해 분석 결과를 부모 컴포넌트에 캐싱
            if (onSaveReport) {
                onSaveReport({
                    formData: aiFormData,
                    results: mockAiReport // 실제 연동 시 API 응답 객체 삽입
                });
            }
        }, 2000);
    };

    // ==========================================
    // [2-3] Main Render
    // ==========================================

    // View: 분석 요청 전 (컨텍스트 입력 폼)
    if (aiStatus === 'ready') {
        return (
            <div className="ai-analysis-view fade-in">
                <div className="analysis-form-container">
                    <div className="form-card">
                        <div className="form-header">
                            <div className="ai-logo-wrapper fade-in">
                                <img src={logoImage} alt="Emoticon Lab" className="ai-logo-img" />
                            </div>
                            <h2>프롬프트 작성하기</h2>
                            <p>캐릭터의 컨셉과 타겟 정보를 입력하면 <br/> AI가 더 정확한 리포트를 생성합니다.</p>
                        </div>
                        <div className="form-body">
                            <div className="form-group">
                                <label>타겟 연령층</label>
                                <div className="radio-group">
                                    {['10대', '20~30대', '직장인', '전연령'].map(age => (
                                        <button
                                            key={age}
                                            className={aiFormData.ageGroup === age ? 'active' : ''}
                                            onClick={() => setAiFormData({ ...aiFormData, ageGroup: age })}
                                        >
                                            {age}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="form-group">
                                <label>이모티콘 타입</label>
                                <div className="radio-group">
                                    <button className={aiFormData.type === 'static' ? 'active' : ''} onClick={() => setAiFormData({ ...aiFormData, type: 'static' })}>정지형</button>
                                    <button className={aiFormData.type === 'animated' ? 'active' : ''} onClick={() => setAiFormData({ ...aiFormData, type: 'animated' })}>움직이는 이모티콘</button>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>캐릭터 설명</label>
                                <textarea
                                    placeholder="예: 이 캐릭터는 소심하지만 할 말은 다 하는 직장인 토끼입니다."
                                    value={aiFormData.description}
                                    onChange={(e) => setAiFormData({ ...aiFormData, description: e.target.value })}
                                />
                            </div>
                            <button className="btn-primary-full" onClick={handleRequestAI}>AI 분석 시작하기</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // View: AI 분석 로딩 상태
    if (aiStatus === 'analyzing') {
        return (
            <div className="ai-analysis-view fade-in">
                <div className="analyzing-container">
                    <div className="spinner-professional"></div>
                    <h3>AI가 이모티콘을 분석 중입니다...</h3>
                    <p>입력하신 컨셉({aiFormData.ageGroup})에 맞춰 데이터를 정밀 스캔하고 있습니다.</p>
                </div>
            </div>
        );
    }

    // View: 분석 완료 및 리포트 렌더링
    // 전역으로 캐싱된 데이터가 있으면 우선 사용, 없으면 Mock 데이터 폴백
    const report = reportData?.results || mockAiReport;

    return (
        <div className="ai-analysis-view fade-in">
            <div className="analysis-report-container">

                {/* 리포트 헤더 (사용자가 입력한 컨텍스트 요약) */}
                <header className="report-header">
                    <div className="header-main">
                        <h2>AI 정밀 분석 리포트</h2>
                        <p><strong>{aiFormData.ageGroup}</strong> 타겟 / <strong>{aiFormData.description ? `'${aiFormData.description.substring(0, 15)}...'` : '캐릭터 기반'}</strong> 분석 결과</p>
                    </div>
                </header>

                {/* 분석 지표 대시보드 그리드 */}
                <div className="analysis-grid">

                    {/* 지표 1: 디자인 일관성 */}
                    <section className="grid-item card consistency-card">
                        <h3 className="card-title">디자인 일관성 (Consistency)</h3>
                        <div className="donut-container" style={{ padding: '1rem 0' }}>
                            <DonutChart score={report.consistency.score} size={180} strokeWidth={22} />
                        </div>
                        <p className="card-note">{report.consistency.note}</p>
                    </section>

                    {/* 지표 2: 감정 스펙트럼 */}
                    <section className="grid-item card emotion-card">
                        <h3 className="card-title">감정 스펙트럼 (Spectrum)</h3>
                        <div style={{ padding: '1rem 0' }}>
                            <RadarChartMock />
                        </div>
                        <p className="card-note">{report.emotion.note}</p>
                    </section>

                    {/* 지표 3: 가독성 체크 */}
                    <section className="card readability-card">
                        <h3 className="card-title">가독성 체크 (Readability)</h3>
                        <div className="warning-badges scrollbar-hide" style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {report.readability.warnings.map((warn, idx) => (
                                <div key={idx} className="warning-badge" style={{ padding: '0.8rem', background: '#FFF9E6', borderRadius: '8px' }}>
                                    {warn}
                                </div>
                            ))}
                            <div className="pass-badge" style={{ padding: '0.8rem', background: '#E8F5E9', borderRadius: '8px' }}>
                                {report.readability.passNote}
                            </div>
                        </div>
                    </section>

                    {/* 지표 4: 타겟/트렌드 적합도 */}
                    <section className="card vibe-card">
                        <h3 className="card-title">타겟/트렌드 (Vibe)</h3>
                        <div className="hashtag-container">
                            {report.vibe.tags.map(tag => <span key={tag} className="hashtag">{tag}</span>)}
                        </div>
                        <p className="card-note"><strong>{aiFormData.ageGroup}</strong> 타겟 키워드와 {report.vibe.matchRate}% 일치합니다.</p>
                    </section>

                    {/* 지표 5: 종합 피드백 및 리스크 안내 */}
                    <section className="grid-item card risk-card">
                        <h3 className="card-title"> AI 종합 심사평 (Overall Feedback) </h3>
                        <div className="risk-status-container">
                            <div className="status-indicator">
                                <div className={`status-light ${report.risks.status === 'caution' ? 'yellow' : ''}`}></div>
                                <div className="status-text">
                                    <span className="main">{report.risks.statusText}</span>
                                    <span className="sub">{report.risks.subText}</span>
                                </div>
                            </div>
                            <ul className="risk-feedback-list">
                                {report.risks.items.map(item => (
                                    <li key={item.id} className={`risk-item ${item.type}`}>
                                        {item.text}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default AiView;