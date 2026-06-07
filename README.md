# Emoticon-Lab
<div align="center">
    <img src="resource/Logo.png" width="300" alt="Logo">
</div>
<br>

## Core Features (핵심 기능)

* **기술적 규격 자동 검수 (Technical Analysis)**

* **AI 컨셉 및 감정 분석 (AI Analysis)**

* **가상 채팅방 시뮬레이션 (UI Simulation)**


<br>

## Deployment (배포)

| 구분 | URL | 호스팅 |
|------|-----|--------|
| Frontend | https://emoticon-lab.vercel.app | Vercel |
| Backend | https://emoticon-lab.onrender.com | Render |

> Backend는 Render 무료 플랜으로 운영 중이며, UptimeRobot을 통해 14분 간격으로 API를 호출하여 Cold Start를 방지합니다.

<br>

## Documentation
* [Conceptualization Document](<Conceptualization_[22212048_김동준].md>)
* [Analysis Document](<Analysis_[22212048_김동준].md>)
* [Design Document](<Design_[22212048_김동준].md>)

<br>

## Getting Started

이 프로젝트를 로컬에서 실행하기 위한 필수 설정 가이드입니다.

### 1. 환경 변수 세팅
보안상 제외된 환경 변수 파일(`.env`)을 먼저 생성해야 합니다.

1. `frontend/.env.example` 파일을 복사하여 `frontend/.env`로 이름을 변경하고 키를 입력합니다.
2. `backend/.env.example` 파일을 복사하여 `backend/.env`로 이름을 변경하고 키를 입력합니다.

### 2. 서버 자동 실행
환경 변수 세팅이 끝났다면, 프로젝트 최상단 폴더에 있는 **`start.bat`** 파일을 더블클릭하여 실행합니다.
* 프론트엔드 라이브러리(`node_modules`) 설치부터 양쪽 서버 구동까지 모두 자동으로 진행됩니다.
