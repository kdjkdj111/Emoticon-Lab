import React, { useState } from 'react';
import './WorkspaceView.css';

import SimulatorView from './SimulatorView';
import TechnicalView from './TechnicalView';
import AiView from './AiView';

const WorkspaceView = ({ onNavigate, data, onUpdateImage, onSaveReport, onSaveProject }) => {
    const [activeTab, setActiveTab] = useState('simulator');

    const handleTitleChange = (e) => {
        onSaveProject({ ...data, title: e.target.value });
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
                            value={data?.title || ''}
                            onChange={handleTitleChange}
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
                    <button className="btn-workspace-reset" onClick={() => {
                        if(window.confirm("현재 작업 중인 모든 데이터와 분석 결과가 사라집니다. 초기화하시겠습니까?")) {
                            onNavigate('upload');
                        }
                    }}>
                         초기화
                    </button>
                    <button className="btn-session-exit" onClick={handleSessionExit}>
                        세션 종료
                    </button>
                </div>
            </nav>

            <div className="workspace-body">
                {activeTab === 'simulator' && (
                    <SimulatorView uploadedImages={data?.uploadedImages} />
                )}

                {activeTab === 'technical' && (
                    <TechnicalView
                        uploadedImages={data?.uploadedImages}
                        reportData={data?.technicalReport}
                        onUpdateImage={onUpdateImage}
                        onSaveReport={(report) => onSaveReport('technicalReport', report)}
                    />
                )}

                {activeTab === 'ai' && (
                    <AiView
                        uploadedImages={data?.uploadedImages}
                        reportData={data?.aiReport}
                        onSaveReport={(report) => onSaveReport('aiReport', report)}
                    />
                )}
            </div>
        </div>
    );
};

export default WorkspaceView;