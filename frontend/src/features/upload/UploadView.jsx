import React, { useState, useRef } from 'react';
import { useImageUpload } from './hooks/useImageUpload';
import SlotItem from './components/SlotItem';
import './UploadView.css';

const UploadView = ({ onNavigate }) => {
  const { 
    slots, uploadedCount, isUploading, 
    processFiles, removeFile, uploadToServer 
  } = useImageUpload(32);
  
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleStartInspection = async () => {
    const uploadedImages = await uploadToServer();
    if (uploadedImages) {
      onNavigate('workspace', { uploadedImages });
    }
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

  return (
      <div className="upload-view fade-in">
        <header className="dashboard-header">
          <div className="header-logo">Emoticon <span className="highlight">Lab</span></div>
          <div className="header-actions">
            <button className="btn-text" onClick={() => onNavigate('start')}>취소</button>
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
                </div>
                <div className="panel-footer-v2">
                  <button className="btn-primary-full" disabled={uploadedCount === 0 || isUploading} onClick={handleStartInspection}>
                    {isUploading ? '업로드 중...' : (uploadedCount === 0 ? '파일을 등록해주세요' : '서버에 저장 후 분석 시작')}
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