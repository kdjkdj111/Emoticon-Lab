import React from 'react';

// 백엔드 영어 상태값 → 한글 표시 매핑
const STATUS_LABEL = {
  'CREATED':              '업로드 완료',
  'TECHNICAL_COMPLETED':  '기술 검수 완료',
  'AI_COMPLETED':         'AI 분석 완료',
  'ALL_COMPLETED':        '전체 분석 완료',
  '검수 완료':             '전체 분석 완료',   // 기존 데이터 하위호환
};

const STATUS_CLASS = {
  'CREATED':              'status-created',
  'TECHNICAL_COMPLETED':  'status-technical',
  'AI_COMPLETED':         'status-ai',
  'ALL_COMPLETED':        'status-success',
  '검수 완료':             'status-success',
};

const ProjectCard = React.memo(({ project, onClick, onDelete }) => {
  const thumbnailUrl = project.uploadedImages?.[0]?.previewUrl || project.thumbnail;
  const label = STATUS_LABEL[project.status] || project.status || '처리 중';
  const statusClass = STATUS_CLASS[project.status] || 'status-warning';

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
            {label}
          </span>
        </div>
      </div>
    </div>
  );
});

export default ProjectCard;
