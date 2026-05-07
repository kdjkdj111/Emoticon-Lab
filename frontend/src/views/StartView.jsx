import { useState } from 'react';
import './StartView.css';
import logoImage from '../assets/Logo.png';

const StartView = ({ onNavigate }) => {
    const [mode, setMode] = useState('landing');
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const handleLoginSuccess = () => {
        setIsLoggedIn(true);
        setMode('landing');
    };

    const handleStartClick = () => {
        if (isLoggedIn) {
            onNavigate('dashboard');
        } else {
            setMode('login');
        }
    };

    return (
        <div className="start-view">
            <div className="start-content">
                <div className="badge">v1.0</div>

                <div className="main-logo-wrapper fade-in">
                    <img src={logoImage} alt="Emoticon Lab" className="main-logo-img" />
                </div>

                <h1 className="main-title">
                    Emoticon <span className="highlight">Lab</span>
                </h1>

                {/* --- 1. 랜딩 모드 --- */}
                {mode === 'landing' && (
                    <div className="fade-in">
                        <p className="subtitle">
                            이모티콘 규격 검증 및<br />
                            실시간 듀얼 시뮬레이션 환경을 경험하세요.
                        </p>

                        <div className="button-group">
                            <button className="btn btn-start" onClick={handleStartClick}>
                                {isLoggedIn ? '작업실 입장하기' : '테스트 시작하기'} <span className="arrow">→</span>
                            </button>

                            {isLoggedIn && (
                                <button className="logout-link" onClick={() => setIsLoggedIn(false)}>
                                    로그아웃
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* --- 2. 로그인 모드 --- */}
                {mode === 'login' && (
                    <div className="fade-in auth-container">
                        <p className="subtitle">계정에 로그인하여 프로젝트를 관리하세요.</p>

                        <div className="auth-form">
                            <input type="email" placeholder="이메일 주소" className="auth-input" />
                            <input type="password" placeholder="비밀번호" className="auth-input" />

                            <div className="button-group" style={{ marginTop: '1.5rem' }}>
                                <button className="btn btn-start" onClick={handleLoginSuccess}>로그인</button>
                                <button className="btn btn-secondary" onClick={() => setMode('signup')}>회원가입 하기</button>
                            </div>
                        </div>

                        <button className="logout-link" onClick={() => setMode('landing')}>뒤로가기</button>
                    </div>
                )}

                {/* --- 3. 회원가입 모드 --- */}
                {mode === 'signup' && (
                    <div className="fade-in auth-container">
                        <p className="subtitle">Emoticon Lab의 <br/>새로운 작가가 되어보세요.</p>

                        <div className="auth-form">
                            <input type="text" placeholder="이름 (닉네임)" className="auth-input" />
                            <input type="email" placeholder="이메일 주소" className="auth-input" />
                            <input type="password" placeholder="비밀번호" className="auth-input" />

                            <div className="button-group" style={{ marginTop: '1.5rem' }}>
                                <button className="btn btn-start" onClick={() => setMode('login')}>가입하기</button>
                                <button className="btn btn-secondary" onClick={() => setMode('login')}>이미 계정이 있으신가요?</button>
                            </div>
                        </div>

                        <button className="logout-link" onClick={() => setMode('landing')}>뒤로가기</button>
                    </div>
                )}
            </div>

            <footer className="start-footer">
                @_dongjunnn
            </footer>
        </div>
    );
};

export default StartView;