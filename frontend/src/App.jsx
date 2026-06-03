import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import StartView from './features/start/StartView';
import DashboardView from './features/dashboard/DashboardView';
import UploadView from './features/upload/UploadView';
import WorkspaceView from './features/workspace/WorkspaceView';
import { supabase } from './utils/supabaseClient';
import { AppContext } from './context/AppContext';

// 로그인하지 않은 사용자를 튕겨내는 경비원 컴포넌트
const ProtectedRoute = ({ session, children }) => {
  if (session === undefined) return null; // 세션 로딩 중 (깜빡임 방지)
  if (!session) return <Navigate to="/" replace />;
  return children;
};

function App() {
  const [session, setSession] = useState(undefined); // undefined = 로딩중, null = 비로그인
  const [projects, setProjects] = useState([]);

  // 1. Supabase Auth 상태 감지
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session ?? null);
      if (session) fetchProjects(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session ?? null);
      if (session) {
        fetchProjects(session.user.id);
      } else {
        setProjects([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. 내 프로젝트 목록 불러오기
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
            const existing = prevProjects.find(ep => ep.id === p.id);
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

  // 3. 특정 프로젝트 상세 정보 불러오기 (WorkspaceView 진입 시 호출)
  const fetchProjectDetail = async (projectId) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/projects/detail/${projectId}`);
      if (res.ok) {
        const detailData = await res.json();

        const mappedImages = (detailData.uploadedImages || []).map(img => ({
          ...img,
          id: Number(img.id)
        }));

        let mappedAiReport = null;
        if (detailData.aiReport) {
          mappedAiReport = {
            formData: { ageGroup: '20~30대', type: 'static', description: '' },
            results: detailData.aiReport
          };
        }

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

        setProjects(prev => prev.map(p => p.id === Number(projectId) ? {
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

  // 4. 단일 이미지 업데이트
  const handleUpdateImage = (projectId, slotId, newFile) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== Number(projectId)) return p;
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

  // 5. 분석 리포트 저장
  const handleSaveReport = (projectId, reportType, reportData) => {
    setProjects(prev => prev.map(p =>
      p.id === Number(projectId) ? { ...p, [reportType]: reportData } : p
    ));
  };

  // 6. 신규 프로젝트 생성 (UploadView에서 호출)
  const handleCreateProject = async (uploadedImages) => {
    if (!session) return null;
    const imageUrls = uploadedImages.map(img => img.supabaseUrl);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/projects/${session.user.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: '신규 이모티콘 세트', imageUrls })
      });
      if (res.ok) {
        const newProject = await res.json();
        const mappedProject = {
          id: newProject.id,
          title: newProject.title,
          status: newProject.status,
          date: new Date(newProject.createdAt).toLocaleDateString(),
          uploadedImages
        };
        setProjects(prev => [mappedProject, ...prev]);
        return newProject.id; // navigate에 사용하기 위해 ID 반환
      }
    } catch (e) {
      console.error("Failed to create project", e);
    }
    return null;
  };

  // 7. 프로젝트 제목/상태 저장
  const handleSaveProject = async (projectId, updatedData) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: updatedData.title,
          status: updatedData.status
        })
      });
      if (res.ok) {
        setProjects(prev => prev.map(p => p.id === Number(projectId) ? { ...p, ...updatedData } : p));
      }
    } catch (e) {
      console.error("Failed to update project", e);
    }
  };

  // 8. 프로젝트 삭제
  const handleDeleteProject = async (projectId) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/projects/${projectId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setProjects(prev => prev.filter(p => p.id !== Number(projectId)));
        return true;
      }
    } catch (e) {
      console.error("Failed to delete project", e);
    }
    return false;
  };

  const contextValue = {
    session,
    projects,
    fetchProjects,
    fetchProjectDetail,
    handleUpdateImage,
    handleSaveReport,
    handleCreateProject,
    handleSaveProject,
    handleDeleteProject,
  };

  return (
    <AppContext.Provider value={contextValue}>
      <div className="app-container">
        <Routes>
          {/* 퍼블릭 라우트 */}
          <Route path="/" element={<StartView />} />

          {/* 보호된 라우트 */}
          <Route path="/dashboard" element={
            <ProtectedRoute session={session}>
              <DashboardView />
            </ProtectedRoute>
          } />
          <Route path="/upload" element={
            <ProtectedRoute session={session}>
              <UploadView />
            </ProtectedRoute>
          } />
          <Route path="/workspace/:projectId" element={
            <ProtectedRoute session={session}>
              <WorkspaceView />
            </ProtectedRoute>
          } />

          {/* 404 처리: 없는 주소는 홈으로 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </AppContext.Provider>
  );
}

export default App;