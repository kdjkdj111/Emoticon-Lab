import React, { useState, useEffect } from 'react';
import './WorkspaceView.css';

import SimulatorView from './subviews/simulator/SimulatorView';
import TechnicalView from './subviews/technical/TechnicalView';
import AIView from './subviews/ai/AIView';

const WorkspaceView = ({ onNavigate, data, onUpdateImage, onSaveReport, onSaveProject }) => {
    const [activeTab, setActiveTab] = useState('simulator');

    const [showResetModal, setShowResetModal] = useState(false);
    const [localTitle, setLocalTitle] = useState(data?.title || '');

    useEffect(() => {
        setLocalTitle(data?.title || '');
    }, [data?.title]);

    const handleTitleChange = (e) => {
        setLocalTitle(e.target.value);
    };

    const handleTitleBlur = () => {
        if (localTitle !== data?.title) {
            onSaveProject({ ...data, title: localTitle });
        }
    };

    const handleTitleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.target.blur();
        }
    };

    // 세션 종료 시 자동 저장 후 대시보드 이동
    const handleSessionExit = () => {
        if (onSaveProject) {
            onSaveProject({ ...data, status: '검수 완료' });
        }
        onNavigate('dashboard');
    };

    return (
        <div className="workspace-view">
            <nav className="gnb">
                <div className="gnb-left">
                    <div className="gnb-logo" onClick={handleSessionExit}>
                        Emoticon <span className="highlight">Lab</span>
                    </div>

                    <div className="gnb-title-area">
                        <input
                            type="text"
                            className="project-title-input"
                            value={localTitle}
                            onChange={handleTitleChange}
                            onBlur={handleTitleBlur}
                            onKeyDown={handleTitleKeyDown}
                            placeholder="프로젝트 제목 입력..."
                        />
                    </div>

                    <div className="gnb-tabs">
                        <button className={activeTab === 'simulator' ? 'active' : ''} onClick={() => setActiveTab('simulator')}>UI 시뮬레이터</button>
                        <button className={activeTab === 'technical' ? 'active' : ''} onClick={() => setActiveTab('technical')}>기술 분석</button>
                        <button className={activeTab === 'ai' ? 'active' : ''} onClick={() => setActiveTab('ai')}>AI 분석</button>
                    </div>
                </div>
                <div className="gnb-right">
                    <button className="btn-workspace-reset" onClick={() => setShowResetModal(true)}>
                        초기화
                    </button>
                    <button className="btn-session-exit" onClick={handleSessionExit}>
                        세션 종료
                    </button>
                </div>
            </nav>

            <div className="workspace-body">
                <div className="tab-wrapper" style={{ display: activeTab === 'simulator' ? 'flex' : 'none' }}>
                    <SimulatorView uploadedImages={data?.uploadedImages} />
                </div>

                <div className="tab-wrapper" style={{ display: activeTab === 'technical' ? 'flex' : 'none' }}>
                    <TechnicalView
                        projectId={data?.id}
                        uploadedImages={data?.uploadedImages}
                        reportData={data?.technicalReport}
                        onUpdateImage={onUpdateImage}
                        onSaveReport={(report) => onSaveReport('technicalReport', report)}
                    />
                </div>

                <div className="tab-wrapper" style={{ display: activeTab === 'ai' ? 'flex' : 'none' }}>
                    <AIView
                        projectId={data?.id}
                        uploadedImages={data?.uploadedImages}
                        reportData={data?.aiReport}
                        onSaveReport={(report) => onSaveReport('aiReport', report)}
                    />
                </div>
            </div>

            {showResetModal && (
                <div className="custom-modal-overlay fade-in">
                    <div className="custom-modal">
                        <div className="modal-icon">⚠️</div>
                        <h3>작업실 초기화</h3>
                        <p>현재 작업 중인 모든 데이터와 <br/>분석 결과가 사라집니다.<br/>정말 초기화하시겠습니까?</p>
                        <div className="modal-actions">
                            <button className="btn-modal-cancel" onClick={() => setShowResetModal(false)}>취소</button>
                            <button className="btn-modal-confirm" onClick={() => onNavigate('upload')}>초기화하기</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkspaceView;