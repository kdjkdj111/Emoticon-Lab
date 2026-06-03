import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useImageUpload } from './hooks/useImageUpload';
import { useAppContext } from '../../context/AppContext';
import SlotItem from './components/SlotItem';
import './UploadView.css';

const UploadView = () => {
  const navigate = useNavigate();
  const { handleCreateProject } = useAppContext();
  const { 
    slots, uploadedCount, isUploading, uploadProgress,
    processFiles, removeFile, uploadToServer 
  } = useImageUpload(32);
  
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStartInspection = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    const uploadedImages = await uploadToServer();
    if (uploadedImages) {
      const newProjectId = await handleCreateProject(uploadedImages);
      if (newProjectId) {
        navigate(`/workspace/${newProjectId}`);
        return;
      }
    }
    
    setIsSubmitting(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) processFiles(e.dataTransfer.files);
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) processFiles(e.target.files);
    e.target.value = null;
  };

  const currentProgress = isUploading ? uploadProgress : Math.round((uploadedCount / 32) * 100);
  const progressLabel = isUploading ? "서버 업로드 진행률" : "파일 선택 진행률";

  return (
      <div className="upload-view fade-in">
        <header className="dashboard-header">
          <div className="header-logo">Emoticon <span className="highlight">Lab</span></div>
          <div className="header-actions">
            <button className="btn-text" onClick={() => navigate('/dashboard')}>취소</button>
          </div>
        </header>

        <main className="upload-content">
          <div className="upload-workspace-split">
            <div className="workspace-left">
              <input type="file" multiple accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileInputChange} />
              <div className={`upload-dropzone ${isDragging ? 'dragging' : ''}`} onClick={() => fileInputRef.current.click()} onDragOver={e => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={handleDrop}>
                <div className="dropzone-inner">
                  <span className="drop-icon">🖼️</span>
                  <p className="drop-text">여기를 클릭하거나 이미지를 드래그 하세요</p>
                </div>
              </div>
              <div className="grid-container-4x8">
                {slots.map(slot => (
                    <SlotItem 
                      key={slot.id} 
                      slot={slot} 
                      onRemove={removeFile} 
                      isUploading={isUploading} 
                    />
                ))}
              </div>
            </div>

            <div className="workspace-right">
              <div className="report-panel">
                <div className="panel-header-v2">
                  <h3 className="report-title">업로드 현황</h3>
                  <p className="report-subtitle">{uploadedCount} / 32 개 선택됨</p>
                </div>
                <div className="report-body">
                  <div className="progress-section">
                    <div className="progress-info">
                      <span className="progress-label">{progressLabel}</span>
                      <span className="progress-percent">{currentProgress}%</span>
                    </div>
                    <div className="progress-bar-bg">
                      <div className="progress-bar-fill" style={{ width: `${currentProgress}%` }}></div>
                    </div>
                  </div>

                  <div className="guideline-section" style={{ marginTop: '2.5rem' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '1rem', color: '#191919' }}>검수 기준 안내</h4>
                    <ul className="spec-check-list">
                      <li className={uploadedCount === 32 ? "pass" : ""}>
                        <div className="check-dot"></div>
                        <div className="spec-text">
                          <p>이미지 개수 (32개)</p>
                          <small>카카오톡 이모티콘 표준 규격</small>
                        </div>
                      </li>
                      <li className={uploadedCount > 0 ? "pass" : ""}>
                        <div className="check-dot"></div>
                        <div className="spec-text">
                          <p>이미지 포맷 (PNG)</p>
                          <small>투명 배경 필수</small>
                        </div>
                      </li>
                      <li>
                        <div className="check-dot"></div>
                        <div className="spec-text">
                          <p>해상도 (360x360)</p>
                          <small>정사각형 비율 유지</small>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="panel-footer-v2">
                  <button className="btn-primary-full" disabled={uploadedCount === 0 || isUploading || isSubmitting} onClick={handleStartInspection}>
                    {isUploading ? `이미지 업로드 중... (${uploadProgress}%)` : isSubmitting ? '프로젝트 생성 중...' : (uploadedCount === 0 ? '파일을 등록해주세요' : '서버에 저장 후 분석 시작')}
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