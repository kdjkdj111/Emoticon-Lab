import React from 'react';

const ProjectCard = React.memo(({ project, onClick, onDelete }) => {
  const thumbnailUrl = project.uploadedImages?.[0]?.previewUrl || project.thumbnail;
  const statusClass = project.status === '검수 완료' ? 'status-success' : 'status-warning';

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm('정말로 이 프로젝트를 삭제하시겠습니까?')) {
      onDelete(project.id);
    }
  };

  return (
    <div 
      className="project-card" 
      onClick={() => onClick(project.id)}
    >
      <button className="btn-delete-project" onClick={handleDelete} title="프로젝트 삭제">
        ✕
      </button>
      <div className="project-thumbnail">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={`${project.title} 썸네일`}
            className="thumbnail-image"
          />
        ) : (
          <div className="thumbnail-fallback">
            <span className="fallback-icon">🎨</span>
          </div>
        )}
      </div>

      <div className="project-info">
        <div className="project-type">{project.type || '정지형'}</div>
        <h3 className="project-name">{project.title}</h3>
        <div className="project-meta">
          <span className="project-date">{project.date}</span>
          <span className={`project-status ${statusClass}`}>
            {project.status}
          </span>
        </div>
      </div>
    </div>
  );
});

export default ProjectCard;
