import { useState, useEffect } from 'react';
import StartView from './views/StartView';
import HistoryView from './views/HistoryView';
import UploadView from './views/UploadView';
import WorkspaceView from './views/WorkspaceView';

import { mockProjects } from './mocks/mockData';

function App() {
  const [currentView, setCurrentView] = useState('start');

  // 로컬 스토리지를 활용한 프로젝트 데이터 관리 (DB 대체)
  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem('emoticon-lab-projects');
    const parsed = saved ? JSON.parse(saved) : [];
    return parsed.length > 0 ? parsed : mockProjects;
  });

  // 현재 작업 중인 프로젝트 ID
  const [activeProjectId, setActiveProjectId] = useState(null);

  // 프로젝트 목록 변경 시 로컬 스토리지 자동 동기화
  useEffect(() => {
    localStorage.setItem('emoticon-lab-projects', JSON.stringify(projects));
  }, [projects]);

  const handleNavigate = (view, projectId = null) => {
    setCurrentView(view);
    if (projectId) {
      setActiveProjectId(projectId);
    } else if (view === 'upload') {
      setActiveProjectId(Date.now()); // 새 프로젝트 시작 시 고유 ID 발급
    }
  };

  // 현재 활성화된 프로젝트 객체 조회
  const currentProject = projects.find(p => p.id === activeProjectId) || null;

  // 단일 이미지 교체 로직
  const handleUpdateImage = (slotId, newFile) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== activeProjectId) return p;

      const updatedImages = p.uploadedImages.map(img => {
        if (img.id === slotId) {
          if (img.previewUrl) URL.revokeObjectURL(img.previewUrl);
          return { ...img, file: newFile, previewUrl: URL.createObjectURL(newFile) };
        }
        return img;
      });

      return { ...p, uploadedImages: updatedImages };
    }));
  };

  // 분석 결과(Technical, AI)를 현재 프로젝트에 저장하는 함수
  const handleSaveReport = (reportType, reportData) => {
    setProjects(prev => prev.map(p =>
        p.id === activeProjectId ? { ...p, [reportType]: reportData } : p
    ));
  };

  // 전체 프로젝트 상태 업데이트 및 저장
  const handleSaveProject = (updatedData) => {
    setProjects(prev => {
      const exists = prev.find(p => p.id === activeProjectId);
      if (exists) {
        return prev.map(p => p.id === activeProjectId ? { ...p, ...updatedData } : p);
      } else {
        const defaultTitle = `신규 프로젝트 (${new Date().toLocaleDateString()})`;
        return [...prev, {
          id: activeProjectId,
          title: updatedData.title || defaultTitle,
          ...updatedData,
          date: new Date().toLocaleDateString(),
          status: '진행 중'
        }];
      }
    });
  };

  return (
      <div className="app-container">
        {currentView === 'start' && <StartView onNavigate={handleNavigate} />}

        {currentView === 'dashboard' && (
            <HistoryView onNavigate={handleNavigate} projects={projects} />
        )}

        {currentView === 'upload' && (
            <UploadView onNavigate={(view, data) => {
              // 업로드 완료 시 새 프로젝트 데이터 생성 후 워크스페이스로 이동
              handleSaveProject({ title: '제목 없는 프로젝트', type: '멈춰있는 이모티콘', uploadedImages: data.uploadedImages });
              handleNavigate('workspace', activeProjectId);
            }} />
        )}

        {currentView === 'workspace' && (
            <WorkspaceView
                onNavigate={handleNavigate}
                data={currentProject}
                onUpdateImage={handleUpdateImage}
                onSaveReport={handleSaveReport}
                onSaveProject={handleSaveProject}
            />
        )}
      </div>
  );
}

export default App;