import React from 'react';

const DonutChart = React.memo(({ score, size = 200, strokeWidth = 20 }) => {
    const radius = size / 2;
    const stroke = strokeWidth;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
        <div className="donut-chart-wrapper" style={{ width: size, height: size, margin: '0 auto' }}>
            <svg height={size} width={size}>
                <circle stroke="#F1F3F5" fill="transparent" strokeWidth={stroke} r={normalizedRadius} cx={radius} cy={radius} />
                <circle
                    stroke="#191919" fill="transparent" strokeWidth={stroke}
                    strokeDasharray={circumference + ' ' + circumference}
                    style={{ strokeDashoffset }} strokeLinecap="round"
                    r={normalizedRadius} cx={radius} cy={radius}
                />
            </svg>
            <div className="donut-text">
                <span className="score" style={{ fontSize: `${size * 0.10}px` }}>{score}</span>
                <span className="label" style={{ fontSize: `${size * 0.08}px`, marginTop: '4px' }}>SCORE</span>
            </div>
        </div>
    );
});

export default DonutChart;
