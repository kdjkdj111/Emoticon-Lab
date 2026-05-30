import { useState } from 'react';
import { supabase } from '../../utils/supabaseClient';
import './StartView.css';
import logoImage from '../../assets/Logo.png';

const StartView = ({ onNavigate }) => {
    const [mode, setMode] = useState('landing');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nickname, setNickname] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Supabase 로그인 처리
    const handleLogin = async () => {
        setIsLoading(true);
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            alert(error.message);
        } else {
            onNavigate('dashboard');
        }
        setIsLoading(false);
    };

    // Supabase 회원가입 처리
    const handleSignup = async () => {
        setIsLoading(true);
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { nickname } }
        });
        if (error) {
            alert(error.message);
        } else {
            alert('가입 성공! 이제 로그인해주세요.');
            setMode('login');
        }
        setIsLoading(false);
    };

    const handleStartClick = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            onNavigate('dashboard');
        } else {
            setMode('login');
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
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

                {mode === 'landing' && (
                    <div className="fade-in">
                        <p className="subtitle">
                            이모티콘 규격 검증 및<br />
                            실시간 듀얼 시뮬레이션 환경을 경험하세요.
                        </p>
                        <div className="button-group">
                            <button className="btn btn-start" onClick={handleStartClick}>
                                시작하기 <span className="arrow">→</span>
                            </button>
                            <button className="logout-link" onClick={handleLogout}>
                                로그아웃
                            </button>
                        </div>
                    </div>
                )}

                {mode === 'login' && (
                    <div className="fade-in auth-container">
                        <p className="subtitle">계정에 로그인하여 프로젝트를 관리하세요.</p>
                        <div className="auth-form">
                            <input type="email" placeholder="이메일 주소" className="auth-input" value={email} onChange={e => setEmail(e.target.value)} />
                            <input type="password" placeholder="비밀번호" className="auth-input" value={password} onChange={e => setPassword(e.target.value)} />
                            <div className="button-group" style={{ marginTop: '1.5rem' }}>
                                <button className="btn btn-start" onClick={handleLogin} disabled={isLoading}>로그인</button>
                                <button className="btn btn-secondary" onClick={() => setMode('signup')} disabled={isLoading}>회원가입 하기</button>
                            </div>
                        </div>
                        <button className="logout-link" onClick={() => setMode('landing')}>뒤로가기</button>
                    </div>
                )}

                {mode === 'signup' && (
                    <div className="fade-in auth-container">
                        <p className="subtitle">Emoticon Lab의 <br/>새로운 작가가 되어보세요.</p>
                        <div className="auth-form">
                            <input type="text" placeholder="이름 (닉네임)" className="auth-input" value={nickname} onChange={e => setNickname(e.target.value)} />
                            <input type="email" placeholder="이메일 주소" className="auth-input" value={email} onChange={e => setEmail(e.target.value)} />
                            <input type="password" placeholder="비밀번호" className="auth-input" value={password} onChange={e => setPassword(e.target.value)} />
                            <div className="button-group" style={{ marginTop: '1.5rem' }}>
                                <button className="btn btn-start" onClick={handleSignup} disabled={isLoading}>가입하기</button>
                                <button className="btn btn-secondary" onClick={() => setMode('login')} disabled={isLoading}>이미 계정이 있으신가요?</button>
                            </div>
                        </div>
                        <button className="logout-link" onClick={() => setMode('landing')}>뒤로가기</button>
                    </div>
                )}
            </div>
            <footer className="start-footer">@_dongjunnn</footer>
        </div>
    );
};

export default StartView;