import React, { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabaseClient';
import { useAppContext } from '../../context/AppContext';
import ProjectCard from './components/ProjectCard';
import EmptyProjectState from './components/EmptyProjectState';
import './DashboardView.css';

const DashboardView = () => {
  const navigate = useNavigate();
  const { session, projects, handleDeleteProject, fetchProjects } = useAppContext();

  // 대시보드 마운트 시 항상 최신 상태를 불러오도록(상태 변경 갱신)
  useEffect(() => {
    if (session?.user?.id) {
      fetchProjects(session.user.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]);

  const handleProjectClick = useCallback((projectId) => {
    navigate(`/workspace/${projectId}`);
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const onDelete = async (projectId) => {
    await handleDeleteProject(projectId);
  };

  return (
    <div className="history-view fade-in">
      <header className="dashboard-header">
        <div className="header-logo">
          Emoticon <span className="highlight">Lab</span>
        </div>
        <div className="header-actions">
          <span className="user-greeting">{session?.user?.user_metadata?.nickname || '작가'}님 👋</span>
          <button className="btn btn-secondary btn-logout" onClick={handleLogout}>
            로그아웃
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        <div className="dashboard-top">
          <div>
            <h2 className="dashboard-title">내 작업실</h2>
            <p className="dashboard-subtitle">과거에 검수했던 이모티콘 프로젝트 목록입니다.</p>
          </div>
          <button
            className="btn-new-project"
            onClick={() => navigate('/upload')}
          >
            <span className="plus-icon">+</span> 새 프로젝트 시작
          </button>
        </div>

        <div className="project-grid">
          {projects.length === 0 ? (
            <EmptyProjectState />
          ) : (
            projects.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={handleProjectClick}
                onDelete={onDelete}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default DashboardView;