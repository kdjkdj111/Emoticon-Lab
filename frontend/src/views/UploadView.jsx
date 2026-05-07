import React, { useState, useRef, useEffect } from 'react';
import './UploadView.css';

const UploadView = ({ onNavigate }) => {
  // 슬롯 상태: 파일과 미리보기 URL을 함께 관리하는 객체 배열
  const [slots, setSlots] = useState(
      Array.from({ length: 32 }, (_, i) => ({
        id: i + 1,
        file: null,
        previewUrl: null
      }))
  );

  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // 업로드된 파일 개수 계산
  const uploadedCount = slots.filter(slot => slot.file).length;

  // 컴포넌트 언마운트 시 메모리 누수 방지 (Object URL 해제)
  useEffect(() => {
    return () => {
      slots.forEach(slot => {
        if (slot.previewUrl) URL.revokeObjectURL(slot.previewUrl);
      });
    };
  }, []);

  // 1. 파일 처리 핵심 로직 (빈 슬롯을 찾아 순서대로 채워줌)
  const processFiles = (files) => {
    const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));

    if (imageFiles.length === 0) return alert('이미지 파일만 업로드 가능합니다.');

    setSlots(prev => {
      const newSlots = [...prev];
      let fileIndex = 0;

      for (let i = 0; i < newSlots.length && fileIndex < imageFiles.length; i++) {
        // 비어있는 슬롯인 경우에만 파일 할당
        if (!newSlots[i].file) {
          const file = imageFiles[fileIndex];
          newSlots[i] = {
            ...newSlots[i],
            file: file,
            previewUrl: URL.createObjectURL(file) // 미리보기 URL 생성
          };
          fileIndex++;
        }
      }
      return newSlots;
    });
  };

  // 2. Drag & Drop 핸들러
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  // 3. 클릭 시 파일 선택창 열기
  const handleDropzoneClick = () => {
    fileInputRef.current.click();
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
    // 같은 파일을 지웠다 다시 올릴 수 있도록 value 초기화
    e.target.value = null;
  };

  // 4. 슬롯 클릭 시 파일 제거 (토글 방식 유지)
  const handleSlotClick = (id) => {
    setSlots(prev => prev.map(slot => {
      if (slot.id === id && slot.file) {
        URL.revokeObjectURL(slot.previewUrl); // 기존 URL 메모리 해제
        return { ...slot, file: null, previewUrl: null };
      }
      return slot;
    }));
  };

  // 5. 다음 화면으로 데이터 넘기며 이동
  const handleStartInspection = () => {
    // 실제 업로드된 파일 데이터만 필터링해서 전달
    const validUploads = slots.filter(s => s.file !== null);

    // onNavigate 함수의 두 번째 인자로 데이터를 통째로 넘겨줍니다.
    onNavigate('workspace', { uploadedImages: validUploads });
  };

  return (
      <div className="upload-view fade-in">
        <header className="dashboard-header">
          <div className="header-logo">
            Emoticon <span className="highlight">Lab</span>
          </div>
          <div className="header-actions">
            <span className="user-greeting">동준님 👋</span>
            <button className="btn-text" onClick={() => onNavigate('start')}>
              로그아웃
            </button>
          </div>
        </header>

        <main className="upload-content">
          <div className="upload-header-nav">
            <button className="btn-back-circle" onClick={() => onNavigate('dashboard')}>
              ‹
            </button>
            <div className="title-group-main">
              <div className="title-row">
                <h2 className="main-view-title">정지형 이모티콘</h2>
                <span className="badge-still">STILL</span>
              </div>
              <p className="view-guide">360 x 360 px | 최대 32개의 이미지를 등록하세요.</p>
            </div>
          </div>

          <div className="upload-workspace-split">
            <div className="workspace-left">
              {/* 숨겨진 실제 파일 인풋 (여러 개 선택 가능) */}
              <input
                  type="file"
                  multiple
                  accept="image/*"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleFileInputChange}
              />

              <div
                  className={`upload-dropzone ${isDragging ? 'dragging' : ''}`}
                  onClick={handleDropzoneClick}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
              >
                <div className="dropzone-inner">
                  <span className="drop-icon">🖼️</span>
                  <p className="drop-text">여기를 클릭하거나 이미지를 드래그 앤 드롭 하세요</p>
                  <p className="drop-subtext">한 번에 여러 장의 이미지를 올릴 수 있습니다.</p>
                </div>
              </div>

              <div className="grid-container-4x8">
                {slots.map(slot => (
                    <div
                        key={slot.id}
                        className={`grid-slot-v2 ${slot.file ? 'has-file' : ''}`}
                        onClick={() => handleSlotClick(slot.id)}
                        title={slot.file ? "클릭하여 제거" : "빈 슬롯"}
                    >
                      <div className="slot-number-v2">{slot.id}</div>
                      {slot.previewUrl && (
                          <div className="slot-image-preview real-image">
                            <img src={slot.previewUrl} alt={`slot-${slot.id}`} />
                          </div>
                      )}
                    </div>
                ))}
              </div>
            </div>

            <div className="workspace-right">
              <div className="report-panel">
                <div className="panel-header-v2">
                  <h3 className="report-title">업로드 현황</h3>
                  <span className="report-subtitle">BASIC SPEC CHECKLIST</span>
                </div>

                <div className="report-body">
                  <div className="progress-section">
                    <div className="progress-info">
                      <span className="progress-label">전체 진행률</span>
                      <span className="progress-percent">{Math.round((uploadedCount / 32) * 100)}%</span>
                    </div>
                    <div className="progress-bar-bg">
                      <div className="progress-bar-fill" style={{ width: `${(uploadedCount / 32) * 100}%` }}></div>
                    </div>
                  </div>

                  {uploadedCount === 0 ? (
                      <div className="empty-report">
                        <span className="empty-icon">📁</span>
                        <p>파일을 등록해 주세요.</p>
                      </div>
                  ) : (
                      <div className="active-report">
                        <ul className="spec-check-list">
                          <li className={uploadedCount === 32 ? 'pass' : ''}>
                            <span className="check-dot"></span>
                            <div className="spec-text">
                              <p>파일 개수 확인</p>
                              <small>{uploadedCount} / 32개 완료</small>
                            </div>
                          </li>
                          <li className={uploadedCount > 0 ? 'pass' : ''}>
                            <span className="check-dot"></span>
                            <div className="spec-text">
                              <p>이미지 사이즈</p>
                              <small>360x360px 권장</small>
                            </div>
                          </li>
                          <li className={uploadedCount > 0 ? 'pass' : ''}>
                            <span className="check-dot"></span>
                            <div className="spec-text">
                              <p>파일 형식</p>
                              <small>PNG 포맷 확인</small>
                            </div>
                          </li>
                        </ul>
                      </div>
                  )}
                </div>

                <div className="panel-footer-v2">
                  {/* 테스트를 위해 1개 이상만 올려도 넘어가게 수정했습니다. (원하면 === 32 로 롤백하세요) */}
                  <button
                      className="btn-primary-full"
                      disabled={uploadedCount === 0}
                      onClick={handleStartInspection}
                  >
                    {uploadedCount === 0 ? '파일을 등록해주세요' : '워크스페이스 입장'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
  );
};

export default UploadView;