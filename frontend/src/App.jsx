import { useState, useEffect } from 'react';
import StartView from './features/start/StartView';
import DashboardView from './features/dashboard/DashboardView';
import UploadView from './features/upload/UploadView';
import WorkspaceView from './features/workspace/WorkspaceView';
import { supabase } from './utils/supabaseClient';

function App() {
  const [currentView, setCurrentView] = useState('start');
  const [session, setSession] = useState(null);
  const [projects, setProjects] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState(null);

  // 1. Supabase Auth 상태 감지
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProjects(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchProjects(session.user.id);
      } else {
        setProjects([]);
        setCurrentView('start');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. 백엔드에서 내 프로젝트 목록 불러오기 (요약 정보)
  const fetchProjects = async (userId) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/projects/${userId}`);
      if (res.ok) {
        const data = await res.json();
        const mappedData = data.map(p => ({
          id: p.projectId,
          title: p.title,
          status: p.status,
          date: new Date(p.createdAt).toLocaleDateString(),
          thumbnail: p.thumbnailUrl,
          uploadedImages: [],
          aiReport: null,
          technicalReport: null
        }));
        setProjects(prevProjects => {
          return mappedData.map(p => {
            const existing = prevProjects.find(existingProj => existingProj.id === p.id);
            if (existing) {
              return {
                ...p,
                uploadedImages: existing.uploadedImages?.length > 0 ? existing.uploadedImages : p.uploadedImages,
                aiReport: existing.aiReport || p.aiReport,
                technicalReport: existing.technicalReport || p.technicalReport
              };
            }
            return p;
          });
        });
      }
    } catch (e) {
      console.error("Failed to fetch projects", e);
    }
  };

  // 3. 백엔드에서 특정 프로젝트 상세 정보 불러오기 (워크스페이스 진입 시)
  const fetchProjectDetail = async (projectId) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/projects/detail/${projectId}`);
      if (res.ok) {
        const detailData = await res.json();

        // 1) 이미지 ID를 숫자로 변환 (슬롯 인덱스와 strict 매칭 보장)
        const mappedImages = (detailData.uploadedImages || []).map(img => ({
          ...img,
          id: Number(img.id)
        }));

        // 2) AI 리포트 포맷 변환 (프론트는 formData와 results 래퍼를 기대함)
        let mappedAiReport = null;
        if (detailData.aiReport) {
            mappedAiReport = {
                formData: { ageGroup: '20~30대', type: 'static', description: '' },
                results: detailData.aiReport
            };
        }

        // 3) 기술 리포트 포맷 변환 (프론트는 enriched된 results 배열을 기대함)
        let mappedTechReport = null;
        if (detailData.technicalReport && detailData.technicalReport.errors) {
            const rawErrors = detailData.technicalReport.errors;
            const enrichedResults = rawErrors.map(err => {
                const matchedImg = mappedImages.find(img => img.id === err.slot);
                return {
                    ...err,
                    previewUrl: matchedImg ? (matchedImg.previewUrl || matchedImg.supabaseUrl) : null,
                    recommendation: err.type === 'pixel' || err.type === 'margin' 
                        ? '해당 영역의 픽셀을 완전히 삭제하거나 투명도를 0%로 조정해 주세요.' 
                        : '이미지 규격(360x360)을 정확히 맞춰서 다시 내보내기 해주세요.'
                };
            });
            mappedTechReport = { results: enrichedResults };
        }

        setProjects(prev => prev.map(p => p.id === projectId ? {
          ...p,
          uploadedImages: mappedImages,
          aiReport: mappedAiReport,
          technicalReport: mappedTechReport
        } : p));
      }
    } catch (e) {
      console.error("Failed to fetch project detail", e);
    }
  };

  const handleNavigate = async (view, projectId = null) => {
    if (view === 'workspace' && projectId) {
      // 워크스페이스 진입 시 상세 데이터 패치
      await fetchProjectDetail(projectId);
      setActiveProjectId(projectId);
    } else if (projectId) {
      setActiveProjectId(projectId);
    }
    setCurrentView(view);
  };

  const currentProject = projects.find(p => p.id === activeProjectId) || null;

  // 단일 이미지 업데이트 (프론트 상태만 변경)
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

  // 분석 리포트 저장 (백엔드 통신 결과)
  const handleSaveReport = (reportType, reportData) => {
    setProjects(prev => prev.map(p =>
        p.id === activeProjectId ? { ...p, [reportType]: reportData } : p
    ));
  };

  // 백엔드 통신 프로젝트 저장
  const handleSaveProject = async (updatedData) => {
    // 신규 프로젝트 생성 처리 (UploadView에서 넘어옴)
    if (updatedData.isNew) {
      const imageUrls = updatedData.uploadedImages.map(img => img.supabaseUrl);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/projects/${session.user.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: updatedData.title || '새 프로젝트', imageUrls })
        });
        if (res.ok) {
          const newProject = await res.json();
          const mappedProject = {
            id: newProject.id,
            title: newProject.title,
            status: newProject.status,
            date: new Date(newProject.createdAt).toLocaleDateString(),
            uploadedImages: updatedData.uploadedImages
          };
          setProjects(prev => [mappedProject, ...prev]);
          setActiveProjectId(newProject.id);
          setCurrentView('workspace');
        }
      } catch (e) {
        console.error("Failed to create project", e);
      }
    } else {
      // 기존 프로젝트 업데이트 로직 (백엔드 통신 추가)
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/projects/${activeProjectId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            title: updatedData.title, 
            status: updatedData.status 
          })
        });
        if (res.ok) {
          // 프론트엔드 상태 업데이트
          setProjects(prev => prev.map(p => p.id === activeProjectId ? { ...p, ...updatedData } : p));
        }
      } catch (e) {
        console.error("Failed to update project", e);
      }
    }
  };

  const handleDeleteProject = async (projectId) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/projects/${projectId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setProjects(prev => prev.filter(p => p.id !== projectId));
        if (currentView === 'workspace') {
          handleNavigate('upload');
        }
      }
    } catch (e) {
      console.error("Failed to delete project", e);
    }
  };

  return (
      <div className="app-container">
        {currentView === 'start' && <StartView onNavigate={handleNavigate} />}

        {currentView === 'dashboard' && (
            <DashboardView 
                onNavigate={handleNavigate} 
                projects={projects} 
                onDeleteProject={handleDeleteProject}
                user={session?.user}
            />
        )}

        {currentView === 'upload' && (
            <UploadView 
                onNavigate={async (view, data) => {
                    if (view === 'start' || view === 'dashboard') {
                        await handleNavigate(view);
                        return;
                    }
                    // 업로드 후 백엔드 프로젝트 생성 요청
                    await handleSaveProject({ 
                        title: '신규 이모티콘 세트', 
                        isNew: true, 
                        uploadedImages: data?.uploadedImages || []
                    });
                }} 
            />
        )}

        {currentView === 'workspace' && (
            <WorkspaceView 
                key={currentProject?.id}
                onNavigate={handleNavigate}
                data={currentProject}
                onUpdateImage={handleUpdateImage}
                onSaveReport={handleSaveReport}
                onSaveProject={handleSaveProject}
                onDeleteProject={() => handleDeleteProject(currentProject?.id)}
            />
        )}
      </div>
  );
}

export default App;