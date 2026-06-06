import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import './WorkspaceView.css';

import SimulatorView from './subviews/simulator/SimulatorView';
import TechnicalView from './subviews/technical/TechnicalView';
import AIView from './subviews/ai/AIView';

const WorkspaceView = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const {
        projects,
        projectsLoaded,
        fetchProjectDetail,
        handleUpdateImage,
        handleSaveReport,
        handleSaveProject,
        handleDeleteProject,
    } = useAppContext();

    const [activeTab, setActiveTab] = useState('simulator');
    const [showResetModal, setShowResetModal] = useState(false);
    const [localTitle, setLocalTitle] = useState('');
    const [isLoading, setIsLoading] = useState(true); // 새로고침 시도 로딩 화면 줄력

    const data = projects.find(p => p.id === Number(projectId)) || null;

    // 워크스페이스 진입 시 상세 데이터 패치 + 소유권 검증
    useEffect(() => {
        if (!projectId) return;
        const alreadyLoaded = data?.uploadedImages?.length > 0;
        if (!alreadyLoaded) {
            setIsLoading(true);
            fetchProjectDetail(projectId).finally(() => setIsLoading(false));
        } else {
            setIsLoading(false);
        }
    }, [projectId]);

    // 소유권 검증: 프로젝트 목록이 로드된 뒤에도 해당 ID가 없으면 대시보드로 차단
    useEffect(() => {
        // projectsLoaded가 false면 아직 패치 중 → 기다림
        if (!projectsLoaded) return;
        const isOwner = projects.some(p => p.id === Number(projectId));
        if (!isOwner) {
            navigate('/dashboard', { replace: true });
        }
    }, [projectsLoaded, projects, projectId]);

    useEffect(() => {
        setLocalTitle(data?.title || '');
    }, [data?.title]);

    const handleTitleChange = (e) => {
        setLocalTitle(e.target.value);
    };

    const handleTitleBlur = () => {
        if (data && localTitle !== data.title) {
            handleSaveProject(projectId, { ...data, title: localTitle });
        }
    };

    const handleTitleKeyDown = (e) => {
        if (e.key === 'Enter') e.target.blur();
    };

    const handleSessionExit = () => {
        // 제목만 저장하고 상태는 건드리지 않음 (상태는 분석 완료 시점에 백엔드가 결정)
        if (data && localTitle !== data.title) {
            handleSaveProject(projectId, { ...data, title: localTitle });
        }
        navigate('/dashboard');
    };

    const handleReset = async () => {
        const ok = await handleDeleteProject(projectId);
        if (ok) navigate('/dashboard');
        setShowResetModal(false);
    };

    if (isLoading) {
        return (
            <div className="workspace-view" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: '#666', fontSize: '1rem' }}>프로젝트 데이터를 불러오는 중...</p>
            </div>
        );
    }

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
                        onUpdateImage={(slotId, newFile) => handleUpdateImage(projectId, slotId, newFile)}
                        onSaveReport={(report) => handleSaveReport(projectId, 'technicalReport', report)}
                    />
                </div>

                <div className="tab-wrapper" style={{ display: activeTab === 'ai' ? 'flex' : 'none' }}>
                    <AIView
                        projectId={data?.id}
                        uploadedImages={data?.uploadedImages}
                        reportData={data?.aiReport}
                        onSaveReport={(report) => handleSaveReport(projectId, 'aiReport', report)}
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
                            <button className="btn-modal-confirm" onClick={handleReset}>초기화(삭제)하기</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkspaceView;