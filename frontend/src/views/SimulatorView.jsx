/**
 * @file SimulatorView.jsx
 * @description 발신자와 수신자 양방향의 채팅 UI/테마를 시뮬레이션하고 테스트하는 컴포넌트
 * @props {Array} uploadedImages - 사용자가 워크스페이스에 업로드한 이모티콘 이미지 배열 (선택)
 */

import React, { useState, useRef, useEffect } from 'react';
import './SimulatorView.css';
import { mockEmoticons, mockMessages as initialMessages } from '../mocks/mockData';

const SimulatorView = ({ uploadedImages = [] }) => {
    // ==========================================
    // [1] State: 시뮬레이터 환경 설정
    // ==========================================
    const [settingTarget, setSettingTarget] = useState('sender'); // 현재 설정 중인 디바이스 ('sender' | 'receiver')
    const [senderSettings, setSenderSettings] = useState({ theme: 'light', bg: 'blue' });
    const [receiverSettings, setReceiverSettings] = useState({ theme: 'dark', bg: 'black' });

    // ==========================================
    // [2] State: 채팅 UI 제어
    // ==========================================
    const [inputs, setInputs] = useState({ sender: "", receiver: "" }); // 각 디바이스의 입력창 상태
    const [keyboards, setKeyboards] = useState({ sender: true, receiver: false }); // 이모티콘 키보드 활성화 여부
    const [messages, setMessages] = useState(initialMessages || []); // 전체 채팅 메시지 내역

    // ==========================================
    // [3] State: 유틸리티 (시간, 스크롤, 이모티콘 리스트)
    // ==========================================
    const [currentTime, setCurrentTime] = useState(new Date());
    const messagesEndRef = useRef(null);

    // 업로드된 이미지가 있으면 우선 사용, 없으면 Mock 데이터 폴백
    const activeEmoticons = uploadedImages && uploadedImages.length > 0
        ? uploadedImages.map(img => img.previewUrl)
        : mockEmoticons;

    // ==========================================
    // [4] Effects
    // ==========================================

    /**
     * @effect 채팅 스크롤 자동 이동
     * 메시지가 추가되거나 키보드가 열릴 때 항상 최하단으로 스크롤을 이동시킴
     */
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, keyboards.sender, keyboards.receiver]);

    /**
     * @effect 상단 상태바 시계
     * 1초마다 현재 시간을 업데이트
     */
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // ==========================================
    // [5] Handlers & Methods
    // ==========================================

    /**
     * @method formatTime
     * @description Date 객체를 '14:05' 형태의 문자열로 변환
     */
    const formatTime = (date) => {
        return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    /**
     * @method sendMessage
     * @description 공통 메시지 전송 로직 (텍스트/이모티콘 통합)
     */
    const sendMessage = (type, content, senderId) => {
        setMessages(prev => [...prev, {
            id: Date.now(),
            sender: senderId,
            type,
            content,
            time: formatTime(new Date())
        }]);
    };

    /**
     * @handler handleSendText
     * @description 텍스트 입력 후 전송 버튼/엔터 입력 시 실행
     */
    const handleSendText = (role) => {
        const text = inputs[role];
        if (text.trim()) {
            const senderId = role === 'sender' ? 'me' : 'other';
            sendMessage('text', text, senderId);
            setInputs(prev => ({ ...prev, [role]: "" })); // 입력창 초기화
        }
    };

    /**
     * @handler handleSendEmoticon
     * @description 키보드에서 이모티콘 클릭 시 실행
     */
    const handleSendEmoticon = (role, emo) => {
        const senderId = role === 'sender' ? 'me' : 'other';
        sendMessage('emoticon', emo, senderId);
    };

    // 현재 포커스된 디바이스의 설정값 참조
    const currentSettings = settingTarget === 'sender' ? senderSettings : receiverSettings;
    const setCurrentSettings = settingTarget === 'sender' ? setSenderSettings : setReceiverSettings;

    // ==========================================
    // [6] Render Helpers
    // ==========================================

    /**
     * @method renderPhone
     * @description 단일 스마트폰 UI를 렌더링 (역할에 따라 좌/우 배치 및 스타일 다름)
     * @param {string} role - 'sender' 또는 'receiver'
     * @param {object} settings - 해당 디바이스의 테마/배경 설정 객체
     */
    const renderPhone = (role, settings) => {
        const isSenderPhone = role === 'sender';
        const inputValue = inputs[role];
        const isKeyboardOpen = keyboards[role];

        return (
            <div className={`phone-container ${role}`}>
                {/* 디바이스 라벨 */}
                <div className="phone-label">
                    <span className={`label-dot ${role}`}></span>
                    {isSenderPhone ? '보내는 사람' : '받는 사람'}
                </div>

                <div className={`phone-frame ${settings.theme} bg-${settings.bg}`}>
                    {/* 상단 상태바 */}
                    <div className="status-bar">
                        <span className="time">{formatTime(currentTime)}</span>
                        <div className="status-icons">
                            <span className="signal">📶</span>
                            <span className="battery">🔋</span>
                        </div>
                    </div>

                    {/* 헤더 */}
                    <div className="chat-header">
                        <span className="back-btn">‹</span>
                        <span className="chat-title">{isSenderPhone ? '내 휴대폰' : '상대방'}</span>
                        <span className="menu-btn">≡</span>
                    </div>

                    {/* 메시지 렌더링 영역 */}
                    <div className="chat-window scrollbar-hide">
                        {messages.map(msg => {
                            // 발신 주체와 현재 디바이스의 역할을 비교하여 '내 말풍선(우측)' 여부 판단
                            const isMyBubble = (role === 'sender' && msg.sender === 'me') ||
                                (role === 'receiver' && msg.sender === 'other');

                            return (
                                <div key={msg.id} className={`chat-message-container ${isMyBubble ? 'is-me' : 'is-other'}`}>
                                    {!isMyBubble && <span className="chat-sender-name">{isSenderPhone ? '상대방' : '작가님'}</span>}

                                    <div className="chat-bubble-row">
                                        {isMyBubble && <span className="chat-time">{msg.time}</span>}

                                        {/* 메시지 타입에 따른 분기 (텍스트 vs 이미지) */}
                                        {msg.type === 'text' ? (
                                            <div className="chat-bubble-text">{msg.content}</div>
                                        ) : (
                                            <div className="chat-bubble-image">
                                                {msg.content.startsWith('blob:') || msg.content.startsWith('http') ? (
                                                    <img src={msg.content} alt="emoticon" />
                                                ) : (
                                                    <div className="text-emoticon">{msg.content}</div>
                                                )}
                                            </div>
                                        )}

                                        {!isMyBubble && <span className="chat-time">{msg.time}</span>}
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* 하단 텍스트 입력 영역 */}
                    <div className="chat-input-area">
                        <button className="input-plus">+</button>
                        <input
                            type="text"
                            className="input-box"
                            placeholder="메시지 입력"
                            value={inputValue}
                            onChange={(e) => setInputs(prev => ({ ...prev, [role]: e.target.value }))}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendText(role)}
                            style={{ border: 'none', outline: 'none', color: settings.theme === 'dark' ? 'white' : '#191919' }}
                        />
                        <button
                            className={`input-emoji-btn ${isKeyboardOpen ? 'active' : ''}`}
                            onClick={() => setKeyboards(prev => ({ ...prev, [role]: !prev[role] }))}
                        >
                            😊
                        </button>
                        <button
                            className="input-send"
                            onClick={() => handleSendText(role)}
                            style={{ cursor: 'pointer', opacity: inputValue.trim() ? 1 : 0.4 }}
                        >
                            ↑
                        </button>
                    </div>

                    {/* 확장 이모티콘 키보드 영역 */}
                    {isKeyboardOpen && (
                        <div className="emoticon-keyboard">
                            <div className="keyboard-handle-wrapper">
                                <div className="keyboard-handle"></div>
                            </div>

                            <div className="keyboard-tab-wrapper">
                                <div className="keyboard-tab-bg">
                                    <button className="keyboard-tab-btn">이모티콘</button>
                                </div>
                            </div>

                            {/* 선택된 이모티콘 세트 썸네일 */}
                            <div className="keyboard-preview-wrapper">
                                <div className="keyboard-preview-box">
                                    {activeEmoticons[0] && (
                                        activeEmoticons[0].startsWith('blob:') || activeEmoticons[0].startsWith('http') ? (
                                            <img src={activeEmoticons[0]} alt="current-set" />
                                        ) : (
                                            <span className="text-emoji-small">{activeEmoticons[0]}</span>
                                        )
                                    )}
                                </div>
                            </div>

                            {/* 이모티콘 리스트 그리드 */}
                            <div className="keyboard-grid scrollbar-hide">
                                {activeEmoticons.map((emo, idx) => (
                                    <div
                                        key={idx}
                                        className="keyboard-emoji-slot group"
                                        onClick={() => handleSendEmoticon(role, emo)}
                                    >
                                        {emo.startsWith('blob:') || emo.startsWith('http') ? (
                                            <img src={emo} alt={`emo-${idx}`} />
                                        ) : (
                                            <span className="text-emoji">{emo}</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="keyboard-bottom-spacer"></div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // ==========================================
    // [7] Main Render
    // ==========================================
    return (
        <div className="simulator-dual-container fade-in">
            {/* 좌측: 발신자 화면 */}
            {renderPhone('sender', senderSettings)}

            {/* 중앙: 컨트롤 패널 (테마/배경 변경) */}
            <div className="simulator-center-settings">
                <div className="target-tabs">
                    <button className={settingTarget === 'sender' ? 'active' : ''} onClick={() => setSettingTarget('sender')}>보내는 사람</button>
                    <button className={settingTarget === 'receiver' ? 'active' : ''} onClick={() => setSettingTarget('receiver')}>받는 사람</button>
                </div>
                <div className="settings-panel">
                    <h3 className="settings-title">상세 설정</h3>
                    <p className="settings-desc">
                        <span className="highlight-text">{settingTarget === 'sender' ? '보내는 사람' : '받는 사람'}</span> 환경 설정 중
                    </p>

                    <div className="setting-group">
                        <label>시스템 설정</label>
                        <div className="toggle-switch">
                            <button className={currentSettings.theme === 'light' ? 'active' : ''} onClick={() => setCurrentSettings({ ...currentSettings, theme: 'light' })}>☀️ 라이트</button>
                            <button className={currentSettings.theme === 'dark' ? 'active' : ''} onClick={() => setCurrentSettings({ ...currentSettings, theme: 'dark' })}>🌙 다크</button>
                        </div>
                    </div>

                    <div className="setting-group">
                        <label>배경 테마</label>
                        <div className="theme-options">
                            <button className={`theme-btn blue ${currentSettings.bg === 'blue' ? 'selected' : ''}`} onClick={() => setCurrentSettings({ ...currentSettings, bg: 'blue' })}><div className="color-circle"></div><span>기본(블루)</span></button>
                            <button className={`theme-btn white ${currentSettings.bg === 'white' ? 'selected' : ''}`} onClick={() => setCurrentSettings({ ...currentSettings, bg: 'white' })}><div className="color-circle"></div><span>화이트</span></button>
                            <button className={`theme-btn black ${currentSettings.bg === 'black' ? 'selected' : ''}`} onClick={() => setCurrentSettings({ ...currentSettings, bg: 'black' })}><div className="color-circle"></div><span>블랙</span></button>
                            <button className={`theme-btn yellow ${currentSettings.bg === 'yellow' ? 'selected' : ''}`} onClick={() => setCurrentSettings({ ...currentSettings, bg: 'yellow' })}><div className="color-circle"></div><span>옐로우</span></button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 우측: 수신자 화면 */}
            {renderPhone('receiver', receiverSettings)}
        </div>
    );
};

export default SimulatorView;