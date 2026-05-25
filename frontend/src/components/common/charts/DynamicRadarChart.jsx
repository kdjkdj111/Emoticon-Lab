import React from 'react';

const DynamicRadarChart = React.memo(({ scores }) => {
    const s = scores || { joy: 50, greeting: 50, sadness: 50, anger: 50, daily: 50 };
    const r = (score) => (score || 50) * 0.8;

    const p1 = `100,${100 - r(s.joy)}`;
    const p2 = `${100 + r(s.greeting) * 0.951},${100 - r(s.greeting) * 0.309}`;
    const p3 = `${100 + r(s.sadness) * 0.587},${100 + r(s.sadness) * 0.809}`;
    const p4 = `${100 - r(s.anger) * 0.587},${100 + r(s.anger) * 0.809}`;
    const p5 = `${100 - r(s.daily) * 0.951},${100 - r(s.daily) * 0.309}`;

    return (
        <div className="radar-chart-wrapper" style={{ display: 'flex', justifyContent: 'center' }}>
            <svg viewBox="0 0 200 200" width="100%" height="160" style={{ maxWidth: '200px' }}>
                <polygon points="100,20 176,75 147,165 53,165 24,75" fill="none" stroke="#EEE" strokeWidth="1" />
                <polygon points="100,60 138,88 123.5,132 76.5,132 62,88" fill="none" stroke="#EEE" strokeWidth="1" />
                <polygon points={`${p1} ${p2} ${p3} ${p4} ${p5}`} fill="rgba(254, 229, 0, 0.5)" stroke="#FEE500" strokeWidth="2" />
                <text x="100" y="15" textAnchor="middle" fontSize="10" fontWeight="700">기쁨</text>
                <text x="185" y="80" textAnchor="start" fontSize="10" fontWeight="700">인사</text>
                <text x="155" y="180" textAnchor="middle" fontSize="10" fontWeight="700">슬픔</text>
                <text x="45" y="180" textAnchor="middle" fontSize="10" fontWeight="700">분노</text>
                <text x="15" y="80" textAnchor="end" fontSize="10" fontWeight="700">일상</text>
            </svg>
        </div>
    );
});

export default DynamicRadarChart;
