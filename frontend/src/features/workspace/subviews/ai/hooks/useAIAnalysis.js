import { useState } from 'react';

export const useAIAnalysis = (projectId, initialData, onSaveReport) => {
  const [aiStatus, setAiStatus] = useState(initialData ? 'completed' : 'ready');
  const [formData, setFormData] = useState(initialData?.formData || {
    ageGroup: '20~30대',
    type: 'static',
    description: ''
  });

  const requestAnalysis = async () => {
    setAiStatus('analyzing');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/analysis/ai/${projectId}`, {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        setAiStatus('completed');
        if (onSaveReport) {
          onSaveReport({
            formData,
            results: data
          });
        }
      } else {
        alert('AI 분석 실패');
        setAiStatus('ready');
      }
    } catch (e) {
      console.error(e);
      alert('네트워크 오류');
      setAiStatus('ready');
    }
  };

  return { aiStatus, formData, setFormData, requestAnalysis };
};
