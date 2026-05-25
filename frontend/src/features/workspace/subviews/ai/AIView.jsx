import React from 'react';
import { useAIAnalysis } from './hooks/useAIAnalysis';
import AIFormView from './components/AIFormView';
import AILoadingView from './components/AILoadingView';
import AIReportView from './components/AIReportView';
import './AIView.css';

const AIView = ({ projectId, reportData, onSaveReport }) => {
    const { aiStatus, formData, setFormData, requestAnalysis } = useAIAnalysis(
        projectId, reportData, onSaveReport
    );

    return (
        <div className="ai-analysis-view fade-in">
            {aiStatus === 'ready' && (
                <AIFormView 
                    formData={formData} 
                    setFormData={setFormData} 
                    onSubmit={requestAnalysis} 
                />
            )}
            
            {aiStatus === 'analyzing' && <AILoadingView formData={formData} />}
            
            {aiStatus === 'completed' && (
                <AIReportView 
                    formData={formData} 
                    report={reportData?.results} 
                />
            )}
        </div>
    );
};

export default AIView;