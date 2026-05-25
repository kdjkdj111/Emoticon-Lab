import React, { useCallback } from 'react';
import ProjectCard from './components/ProjectCard';
import EmptyProjectState from './components/EmptyProjectState';
import './DashboardView.css';

const DashboardView = ({ onNavigate, projects = [] }) => {
  
  const handleProjectClick = useCallback((projectId) => {
    onNavigate('workspace', projectId);
  }, [onNavigate]);

  return (
    <div className="history-view fade-in">
      <header className="dashboard-header">
        <div className="header-logo">
          Emoticon <span className="highlight">Lab</span>
        </div>
        <div className="header-actions">
          <span className="user-greeting">동준님 👋</span>
          <button className="btn btn-secondary btn-logout" onClick={() => onNavigate('start')}>
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
            onClick={() => onNavigate('upload')}
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
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default DashboardView;