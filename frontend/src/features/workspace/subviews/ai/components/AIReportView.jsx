import React from 'react';
import DonutChart from '../../../../../components/common/charts/DonutChart';
import DynamicRadarChart from '../../../../../components/common/charts/DynamicRadarChart';

const AIReportView = React.memo(({ formData, report }) => {
    if (!report) return null;

    return (
        <div className="analysis-report-container">
            <header className="report-header">
                <div className="header-main">
                    <h2>AI 정밀 분석 리포트</h2>
                    <p><strong>{formData.ageGroup}</strong> 타겟 / <strong>{formData.description ? `'${formData.description.substring(0, 15)}...'` : '캐릭터 기반'}</strong> 분석 결과</p>
                </div>
            </header>

            <div className="analysis-grid">
                <section className="grid-item card consistency-card">
                    <h3 className="card-title">디자인 일관성 (Consistency)</h3>
                    <div className="chart-wrapper">
                        <DonutChart score={report.consistency.score} size={180} strokeWidth={22} />
                    </div>
                    <p className="card-note">{report.consistency.note}</p>
                </section>

                <section className="grid-item card emotion-card">
                    <h3 className="card-title">감정 스펙트럼 (Spectrum)</h3>
                    <div className="chart-wrapper">
                        <DynamicRadarChart scores={report.emotion.scores} />
                    </div>
                    <p className="card-note">{report.emotion.note}</p>
                </section>

                <section className="card readability-card">
                    <h3 className="card-title">가독성 체크 (Readability)</h3>
                    <div className="warning-badges scrollbar-hide">
                        {report.readability.warnings.map((warn, idx) => (
                            <div key={idx} className="warning-badge">
                                {warn}
                            </div>
                        ))}
                        <div className="pass-badge">
                            {report.readability.passNote}
                        </div>
                    </div>
                </section>

                <section className="card vibe-card">
                    <h3 className="card-title">타겟/트렌드 (Vibe)</h3>
                    <div className="hashtag-container">
                        {report.vibe.tags.map(tag => <span key={tag} className="hashtag">{tag}</span>)}
                    </div>
                    <p className="card-note"><strong>{formData.ageGroup}</strong> 타겟 키워드와 {report.vibe.matchRate}% 일치합니다.</p>
                </section>

                <section className="grid-item card risk-card">
                    <h3 className="card-title"> AI 종합 심사평 (Overall Feedback) </h3>
                    <div className="risk-status-container">
                        <div className="status-indicator">
                            <div className={`status-light ${report.risks.status === 'caution' ? 'yellow' : ''}`}></div>
                            <div className="status-text">
                                <span className="main">{report.risks.statusText}</span>
                                <span className="sub">{report.risks.subText}</span>
                            </div>
                        </div>
                        <ul className="risk-feedback-list">
                            {report.risks.items.map(item => (
                                <li key={item.id} className={`risk-item ${item.type}`}>
                                    {item.text}
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>
            </div>
        </div>
    );
});

export default AIReportView;
