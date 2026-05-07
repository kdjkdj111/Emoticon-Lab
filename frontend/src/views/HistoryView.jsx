/**
 * @file HistoryView.jsx
 * @description 사용자의 이전 이모티콘 검수 프로젝트 이력을 조회하고, 새로운 프로젝트를 시작할 수 있는 대시보드 컴포넌트
 * @props {Function} onNavigate - 화면 전환(라우팅)을 처리하는 부모 콜백 함수 ('start', 'upload', 'workspace' 등으로 이동)
 * @props {Array} projects - App.jsx에서 관리하는 실제 사용자의 프로젝트 배열 데이터 (로컬 스토리지 연동)
 */

import './HistoryView.css';

const HistoryView = ({ onNavigate, projects = [] }) => {

  // ==========================================
  // [1] Main Render
  // ==========================================
  return (
      <div className="history-view fade-in">

        {/* ==========================================
            [1-1] Header: GNB 및 사용자 세션 관리 영역
            ========================================== */}
        <header className="dashboard-header">
          <div className="header-logo">
            Emoticon <span className="highlight">Lab</span>
          </div>
          <div className="header-actions">
            <span className="user-greeting">동준님 👋</span>
            {/* 세션 종료(로그아웃) 처리 후 시작 화면(Auth 뷰)으로 라우팅 */}
            <button className="btn btn-secondary btn-logout" onClick={() => onNavigate('start')}>
              로그아웃
            </button>
          </div>
        </header>

        {/* ==========================================
            [1-2] Main Content: 대시보드 본문 영역
            ========================================== */}
        <main className="dashboard-content">

          {/* Section: 타이틀 및 신규 프로젝트 생성 액션 */}
          <div className="dashboard-top">
            <div>
              <h2 className="dashboard-title">내 작업실</h2>
              <p className="dashboard-subtitle">과거에 검수했던 이모티콘 프로젝트 목록입니다.</p>
            </div>
            {/* 업로드 뷰로 이동하여 새로운 검수 세션 플로우(Flow) 시작 */}
            <button
                className="btn-new-project"
                onClick={() => onNavigate('upload')}
            >
              <span className="plus-icon">+</span> 새 프로젝트 시작
            </button>
          </div>

          {/* ==========================================
              [1-3] Project Grid: 프로젝트 리스트 동적 렌더링
              ========================================== */}
          <div className="project-grid">
            {/* 데이터 유무에 따른 조건부 렌더링 (Empty State 처리) */}
            {projects.length === 0 ? (
                <div className="empty-projects" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: '#888', fontSize: '0.95rem' }}>
                  아직 생성된 프로젝트가 없습니다. 우측 상단의 새 프로젝트를 시작해 보세요!
                </div>
            ) : (
                projects.map(project => (
                    <div
                        key={project.id}
                        className="project-card"
                        // 각 카드 클릭 시 해당 프로젝트의 고유 ID를 파라미터로 넘겨 워크스페이스 뷰로 복원
                        onClick={() => onNavigate('workspace', project.id)}
                        style={{ cursor: 'pointer' }}
                    >
                      {/* 프로젝트 썸네일 (대표 이미지: 업로드한 1번째 이미지 활용) */}
                      <div className="project-thumbnail">
                        {project.uploadedImages?.[0]?.previewUrl || project.thumbnail ? (
                            <img
                                src={project.uploadedImages?.[0]?.previewUrl || project.thumbnail}
                                alt={`${project.title} 썸네일`}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'contain',
                                  borderRadius: '8px'
                                }}
                            />
                        ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F1F3F5', borderRadius: '8px' }}>
                              <span style={{ fontSize: '2rem' }}>🎨</span>
                            </div>
                        )}
                      </div>

                      {/* 프로젝트 메타 정보 (타입, 제목, 날짜, 상태) */}
                      <div className="project-info">
                        <div className="project-type">{project.type || '정지형'}</div>
                        <h3 className="project-name">{project.title}</h3>

                        <div className="project-meta">
                          <span className="project-date">{project.date}</span>
                          {/* 상태값('검수 완료', '진행 중' 등)에 따라 동적으로 상태 태그 CSS 클래스 부여 */}
                          <span className={`project-status status-${project.status === '검수 완료' ? 'success' : 'warning'}`}>
                            {project.status}
                          </span>
                        </div>
                      </div>
                    </div>
                ))
            )}
          </div>

        </main>
      </div>
  );
};

export default HistoryView;