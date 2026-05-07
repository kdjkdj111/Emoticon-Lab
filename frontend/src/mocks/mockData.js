import thumb1 from '../assets/mock1.png';
import thumb2 from '../assets/mock2.png';
import thumb3 from '../assets/mock3.png';

// 1. 프로젝트 목록 (HistoryView 용)
export const mockProjects = [
    { id: 1, title: '아 배고파', type: '멈춰있는 이모티콘', date: '2026.05.01', status: '검수 완료', thumbnail: thumb1 },
    { id: 2, title: '아 열 받아', type: '멈춰있는 이모티콘', date: '2026.04.28', status: '수정 필요', thumbnail: thumb2 },
    { id: 3, title: '아 배불러', type: '멈춰있는 이모티콘', date: '2026.04.15', status: '검수 완료', thumbnail: thumb3 },
];

// 2. 이모티콘 리스트 (SimulatorView 용)
export const mockEmoticons = ['🎨', '✨', '🔥', '💖', '👍', '🤔', '🎉', '😂', '👀', '💡', '🚀', '🙌'];

// 3. 시뮬레이터 채팅 메시지 (SimulatorView 용)
export const mockMessages = [
    { id: 1, sender: 'other', type: 'text', content: '이모티콘 시안 언제 나오나요?', time: '14:12' },
    { id: 2, sender: 'me', type: 'text', content: '지금 완성해서 보내드립니다!', time: '14:14' }
];

// 4. 기술 분석 검수 결과 (TechnicalView 용)
export const mockAnalysisResults = [
    { slot: 3, type: 'pixel', message: '외곽선 주변에 미세한 픽셀 노이즈가 발견되었습니다.', coords: { x: 120, y: 85 } },
    { slot: 8, type: 'size', message: '이미지 사이즈가 규격(360x360)을 초과했습니다. (362x360)', coords: null },
    { slot: 15, type: 'pixel', message: '배경 투명화가 덜 된 영역이 발견되었습니다.', coords: { x: 240, y: 190 } },
    { slot: 24, type: 'format', message: 'RGB 컬러모드가 아닙니다. (CMYK)', coords: null },
];

// 5. AI 분석 결과 리포트 (AiView 용 더미 데이터)
export const mockAiReport = {
    consistency: {
        score: 85.4,
        note: '형태와 선 굵기가 32컷 전반에서 우수하게 유지되고 있습니다.'
    },
    emotion: {
        note: '기쁨과 일상 비중이 높아 실생활 활용도가 매우 높습니다.'
        // 실제 구현 시 레이더 차트의 꼭짓점 데이터도 배열로 받을 수 있습니다.
    },
    readability: {
        warnings: [
            '⚠️ 12번 이미지 가독성 주의',
            '⚠️ 24번 이미지 대비 부족'
        ],
        passNote: '✅ 나머지 30컷 가독성 양호'
    },
    vibe: {
        tags: ['#직장인공감', '#B급감성', '#귀여운', '#몽글몽글', '#MZ세대'],
        matchRate: 92
    },
    risks: {
        status: 'caution',
        statusText: '주의 (Caution)',
        subText: '보완 필요',
        items: [
            { id: 1, type: 'safe', text: '🟢 저작권/표절 위험 미감지' },
            { id: 2, type: 'caution', text: '🟡 8번 이미지: 로고 유사성 감지' },
            { id: 3, type: 'safe', text: '🟢 혐오/비속어 표현 미감지' },
            { id: 4, type: 'caution', text: '🟡 19번 이미지: 선정성 오인 가능성' }
        ]
    }
};