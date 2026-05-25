import React from 'react';
import logoImage from "../../../../../assets/Logo.png";

const AIFormView = ({ formData, setFormData, onSubmit }) => {
    return (
        <div className="analysis-form-container">
            <div className="form-card">
                <div className="form-header">
                    <div className="ai-logo-wrapper fade-in">
                        <img src={logoImage} alt="Emoticon Lab" className="ai-logo-img" />
                    </div>
                    <h2>프롬프트 작성하기</h2>
                    <p>캐릭터의 컨셉과 타겟 정보를 입력하면 <br/> AI가 더 정확한 리포트를 생성합니다.</p>
                </div>
                <div className="form-body">
                    <div className="form-group">
                        <label>타겟 연령층</label>
                        <div className="radio-group">
                            {['10대', '20~30대', '직장인', '전연령'].map(age => (
                                <button
                                    key={age}
                                    className={formData.ageGroup === age ? 'active' : ''}
                                    onClick={() => setFormData({ ...formData, ageGroup: age })}
                                >
                                    {age}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="form-group">
                        <label>이모티콘 타입</label>
                        <div className="radio-group">
                            <button className={formData.type === 'static' ? 'active' : ''} onClick={() => setFormData({ ...formData, type: 'static' })}>정지형</button>
                            <button className={formData.type === 'animated' ? 'active' : ''} onClick={() => setFormData({ ...formData, type: 'animated' })}>움직이는 이모티콘</button>
                        </div>
                    </div>
                    <div className="form-group">
                        <label>캐릭터 설명</label>
                        <textarea
                            placeholder="예: 이 캐릭터는 소심하지만 할 말은 다 하는 직장인 토끼입니다."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                    <button className="btn-primary-full" onClick={onSubmit}>AI 분석 시작하기</button>
                </div>
            </div>
        </div>
    );
};

export default AIFormView;
