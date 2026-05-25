import React from 'react';

const AILoadingView = ({ formData }) => {
    return (
        <div className="analyzing-container">
            <div className="spinner-professional"></div>
            <h3>AI가 이모티콘을 분석 중입니다...</h3>
            <p>입력하신 컨셉({formData.ageGroup})에 맞춰 데이터를 정밀 스캔하고 있습니다.</p>
        </div>
    );
};

export default AILoadingView;
