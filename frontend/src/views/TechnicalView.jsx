/**
 * @file TechnicalView.jsx
 * @description Spring 백엔드와 통신하여 업로드된 이모티콘의 기술적 결함(픽셀 노이즈, 해상도, 포맷 등)을 분석하고, 수정 사항을 동기화하는 컴포넌트
 * @props {Array} uploadedImages - 사용자가 워크스페이스에 업로드한 원본 이미지 배열
 * @props {Function} onUpdateImage - 특정 슬롯의 이미지를 교체하여 서버와 동기화하는 콜백 함수
 * @props {Object} reportData - 캐싱된 분석 결과 데이터 (탭 전환 시 상태 유지용)
 * @props {Function} onSaveReport - 분석 완료 및 에러 해결 시 최신 상태를 전역 상태에 업데이트하는 콜백 함수
 */

import React, { useState, useRef, useEffect } from 'react';
import './TechnicalView.css';
import { mockAnalysisResults as fallbackData } from '../mocks/mockData';

const TechnicalView = ({ uploadedImages = [], onUpdateImage, reportData, onSaveReport }) => {

    // ==========================================
    // [1] State: API 통신 및 진행 상태 관리
    // ==========================================
    // 캐싱된 결과(reportData)가 존재하면 API 호출을 건너뛰고 'completed' 뷰를 렌더링
    const [analysisStatus, setAnalysisStatus] = useState(reportData ? 'completed' : 'ready');
    const [analysisProgress, setAnalysisProgress] = useState(0);

    // ==========================================
    // [2] State: 검수 결과(Error Report) 데이터 관리
    // ==========================================
    const [dynamicResults, setDynamicResults] = useState(reportData?.results || []);
    const [selectedErrorSlot, setSelectedErrorSlot] = useState(reportData?.results?.[0] || null);

    // ==========================================
    // [3] Refs: DOM 참조
    // ==========================================
    const fileInputRef = useRef(null); // 개별 이미지 교체를 위한 숨겨진 File Input 참조

    // ==========================================
    // [4] Methods & Handlers
    // ==========================================

    /**
     * @method processAnalysisData
     * @description 백엔드(Spring) 기술 검수 API의 응답 데이터를 프론트엔드 UI 규격에 맞게 파싱 및 매핑
     * @param {Array} images - 분석을 요청한 원본 이미지 리스트
     * @returns {Array} 에러 유형, 좌표(coords), 권장 수정 사항이 포함된 리포트 객체 배열
     */
    const processAnalysisData = (images) => {
        if (!images || images.length === 0) return fallbackData;

        // TODO: 실제 API 연동 시 response.data.errors 형태의 서버 응답을 매핑하는 로직으로 대체
        const targetImages = images.slice(0, Math.min(images.length, 4));
        const serverErrorTypes = [
            { type: 'pixel', message: '외곽선 주변에 미세한 픽셀 노이즈가 발견되었습니다.', coords: { x: 120, y: 85 }, rec: '해당 영역의 픽셀을 완전히 삭제하거나 투명도를 0%로 조정해 주세요.' },
            { type: 'size', message: '이미지 사이즈가 규격(360x360)을 초과했습니다. (362x360)', coords: null, rec: '캔버스 사이즈를 360x360px로 정확히 맞춰서 다시 내보내기 해주세요.' },
            { type: 'pixel', message: '배경 투명화가 덜 된 영역이 발견되었습니다.', coords: { x: 220, y: 190 }, rec: '알파 채널(투명도)이 1~5% 남아있는 픽셀이 있습니다. 지우개 툴로 확실히 지워주세요.' },
            { type: 'format', message: 'RGB 컬러모드가 아닙니다. (CMYK)', coords: null, rec: '문서의 컬러 모드를 RGB로 변경 후 저장해 주세요.' },
        ];

        return targetImages.map((img, index) => {
            const template = serverErrorTypes[index % serverErrorTypes.length];
            return {
                slot: img.id,
                previewUrl: img.previewUrl,
                type: template.type,
                message: template.message,
                coords: template.coords,
                recommendation: template.rec
            };
        });
    };

    /**
     * @handler handleStartAnalysis
     * @description '분석 시작' 요청. 로딩 상태를 표시하고 API 호출 완료 후 데이터를 상태에 동기화
     */
    const handleStartAnalysis = () => {
        setAnalysisStatus('analyzing');
        setAnalysisProgress(0);

        // TODO: setInterval은 실제 API 구현 시 axios 통신 및 진행률(Polling/SSE) 로직으로 대체
        const pollingInterval = setInterval(() => {
            setAnalysisProgress(prev => {
                if (prev >= 100) {
                    clearInterval(pollingInterval);

                    // 1. 서버 응답 데이터 파싱
                    const parsedResults = processAnalysisData(uploadedImages);
                    setDynamicResults(parsedResults);
                    setSelectedErrorSlot(parsedResults[0]);
                    setAnalysisStatus('completed');

                    // 2. 파싱된 결과를 전역 상태(Context/부모 State)에 캐싱
                    if (onSaveReport) onSaveReport({ results: parsedResults });

                    return 100;
                }
                return prev + 10;
            });
        }, 300);
    };

    /**
     * @handler handleReuploadClick
     * @description 에러가 발생한 슬롯의 이미지 교체 플로우 시작 (Input Trigger)
     */
    const handleReuploadClick = () => fileInputRef.current.click();

    /**
     * @handler handleFileChange
     * @description 새로운 파일 선택 시, 이미지를 교체하고 해당 에러 슬롯을 '해결됨(Resolved)' 상태로 처리
     */
    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file && selectedErrorSlot) {
            // 1. 부모 컴포넌트에 파일 교체 이벤트 전달 (서버 재업로드 트리거)
            if (onUpdateImage) onUpdateImage(selectedErrorSlot.slot, file);
            alert(`${selectedErrorSlot.slot}번 슬롯 이미지가 성공적으로 교체되었습니다!`);

            // 2. 해결된 에러를 리포트 리스트에서 제거 (Resolved 반영)
            const updatedResults = dynamicResults.filter(err => err.slot !== selectedErrorSlot.slot);
            setDynamicResults(updatedResults);
            setSelectedErrorSlot(updatedResults.length > 0 ? updatedResults[0] : null);

            // 3. 갱신된 에러 리스트를 전역 상태에 동기화
            if (onSaveReport) onSaveReport({ results: updatedResults });

            // 4. 동일한 파일 연속 업로드 버그 방지를 위한 값 초기화
            e.target.value = null;
        }
    };

    // 검수 현황 요약 (통계)
    const totalCount = uploadedImages.length > 0 ? uploadedImages.length : 32;
    const failCount = dynamicResults.length;
    const passCount = totalCount - failCount;

    // ==========================================
    // [5] Main Render (통신 상태에 따른 View 분기)
    // ==========================================

    // View: 분석 요청 전 (Ready)
    if (analysisStatus === 'ready') {
        return (
            <div className="technical-ready fade-in">
                <div className="ready-card">
                    <div className="ready-icon">🔍</div>
                    <h3>기술 분석 시작</h3>
                    <p>업로드된 {totalCount}개의 이미지를 서버로 전송하여<br />픽셀 노이즈, 해상도, 알파 채널 등을<br/> 정밀 검사합니다.</p>
                    <button className="btn-start-analysis" onClick={handleStartAnalysis}>
                        분석 시작
                    </button>
                </div>
            </div>
        );
    }

    // View: 서버 분석 중 (Pending/Analyzing)
    if (analysisStatus === 'analyzing') {
        return (
            <div className="technical-analyzing fade-in">
                <div className="analyzing-card">
                    <div className="spinner-large"></div>
                    <h3>서버 분석 중...</h3>
                    <p>이미지 데이터를 계산하고 있습니다.<br/> 잠시만 기다려 주세요.</p>
                    <div className="analysis-progress-bar">
                        <div className="progress-fill" style={{ width: `${analysisProgress}%` }}></div>
                    </div>
                    <span className="progress-text">{analysisProgress}% 완료</span>
                </div>
            </div>
        );
    }

    // View: 분석 완료 (Completed)
    return (
        <div className="technical-completed fade-in">
            <div className="technical-split">

                {/* 5-1. 검수 결과 리스트 패널 */}
                <div className="error-list-panel">
                    <div className="panel-header-v3">
                        <h4>검수 결과 리포트</h4>
                        <div className="status-summary">
                            <span className="pass-tag">Pass {passCount}</span>
                            <span className="fail-tag">Fail {failCount}</span>
                        </div>
                    </div>

                    <div className="error-items">
                        {/* 이슈가 모두 해결된 경우 */}
                        {dynamicResults.length === 0 ? (
                            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#888', fontSize: '0.9rem' }}>
                                🎉 모든 에러가 해결되었습니다!
                            </div>
                        ) : (
                            // 미해결 이슈 리스트 렌더링
                            dynamicResults.map((err, idx) => (
                                <div
                                    key={idx}
                                    className={`error-item-card ${selectedErrorSlot?.slot === err.slot ? 'active' : ''}`}
                                    onClick={() => setSelectedErrorSlot(err)}
                                >
                                    <div className="error-slot-num">{err.slot}</div>
                                    <div className="error-info">
                                        <p className="error-type-label">{err.type === 'pixel' ? '픽셀 노이즈' : '규격/포맷 오류'}</p>
                                        <p className="error-msg-short">{err.message}</p>
                                    </div>
                                    <span className="arrow">›</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* 5-2. 상세 뷰어 및 이미지 교체 패널 */}
                <div className="error-detail-viewer">
                    {selectedErrorSlot ? (
                        <div className="detail-inner">
                            <div className="detail-header-v3">
                                <h5>{selectedErrorSlot.slot}번 이미지 상세 분석</h5>
                                <p>{selectedErrorSlot.message}</p>
                            </div>

                            <div className="image-inspector-area">
                                <div className="inspector-canvas">
                                    <div className="mock-inspect-image">

                                        {/* 원본 이미지 렌더링 */}
                                        {selectedErrorSlot.previewUrl ? (
                                            <img
                                                src={selectedErrorSlot.previewUrl}
                                                alt={`Error in slot ${selectedErrorSlot.slot}`}
                                                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                            />
                                        ) : (
                                            <span className="emoji-huge">🎨</span>
                                        )}

                                        {/* 서버에서 전달받은 좌표에 크로스헤어 마커 렌더링 */}
                                        {selectedErrorSlot.coords && (
                                            <div
                                                className="error-crosshair"
                                                style={{
                                                    left: `${selectedErrorSlot.coords.x}px`,
                                                    top: `${selectedErrorSlot.coords.y}px`
                                                }}
                                            >
                                                <div className="crosshair-target"></div>
                                                <div className="crosshair-label">Issue Point</div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* 상세 데이터 메타 정보 및 해결 가이드 */}
                                <div className="inspector-meta">
                                    <div className="meta-row">
                                        <span>검출 좌표</span>
                                        <strong>{selectedErrorSlot.coords ? `X: ${selectedErrorSlot.coords.x}, Y: ${selectedErrorSlot.coords.y}` : '전체 영역'}</strong>
                                    </div>
                                    <div className="meta-row">
                                        <span>오류 강도</span>
                                        <strong className="high">High</strong>
                                    </div>
                                    <div className="meta-row">
                                        <span>권장 사항</span>
                                        <p>{selectedErrorSlot.recommendation || '해당 영역의 픽셀을 완전히 삭제하거나 투명도를 0%로 조정해 주세요.'}</p>
                                    </div>

                                    {/* 이미지 개별 업로드 컨트롤 */}
                                    <div className="meta-row" style={{ marginTop: '1rem' }}>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            ref={fileInputRef}
                                            style={{ display: 'none' }}
                                            onChange={handleFileChange}
                                        />
                                        <button
                                            onClick={handleReuploadClick}
                                            style={{
                                                width: '100%', padding: '1rem', background: '#191919', color: 'white',
                                                border: 'none', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 'bold',
                                                cursor: 'pointer', transition: 'background 0.2s',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                                            }}
                                            onMouseOver={(e) => e.target.style.background = '#333'}
                                            onMouseOut={(e) => e.target.style.background = '#191919'}
                                        >
                                            현재 이미지 개별 교체
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        // No selected error state
                        <div className="empty-detail">
                            <p>왼쪽 리스트에서 항목을 선택하거나, 모든 에러가 해결되었습니다.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TechnicalView;