# @pf-dev/cctv

## CCTV 및 실시간 영상 스트리밍 React 패키지

HLS, WHEP 프로토콜을 지원하는 실시간 영상 스트리밍 패키지입니다.

## ✨ 주요 기능

- 📹 **HLS 스트리밍**: hls.js 기반, LL-HLS 최적화 (1-3초 레이턴시)
- 🚀 **WHEP 스트리밍**: WebRTC HTTP Egress Protocol (~1초 레이턴시)
- 🎨 **Headless 컴포넌트**: CCTVPlayer (완전한 UI 커스터마이징)
- 🔄 **자동 재연결**: 네트워크 장애 시 자동 복구
- 💾 **Zustand 상태 관리**: HLS/WHEP Store
- 🌐 **다중 서버 지원**: 여러 미디어 서버 동시 사용

## 📦 설치

```bash
pnpm add @pf-dev/cctv
```

## 🚀 빠른 시작

### 초기 설정

```typescript
// App.tsx 또는 main.tsx
import { useWHEPStore } from "@pf-dev/cctv";

// WHEP만 초기화 필요
useWHEPStore.getState().initialize();

// HLS는 초기 설정 완전 불필요!
```

### HLS 스트리밍

```tsx
import { useHLSStream } from "@pf-dev/cctv";

function HLSPlayer({ streamUrl }: { streamUrl: string }) {
  const { videoRef, status, error, stats } = useHLSStream(streamUrl);

  return (
    <div>
      <video ref={videoRef} autoPlay playsInline muted />
      <p>Status: {status}</p>
      <p>Bitrate: {stats.bitrate} kbps</p>
      {error && <p>Error: {error}</p>}
    </div>
  );
}

// 사용
<HLSPlayer streamUrl="http://192.168.10.181:8120/CCTV-001/index.m3u8" />;
```

### WHEP 스트리밍

```tsx
import { useWHEPStream } from "@pf-dev/cctv";

function WHEPPlayer({ streamUrl }: { streamUrl: string }) {
  const { videoRef, status, error } = useWHEPStream(streamUrl);

  return (
    <div>
      <video ref={videoRef} autoPlay playsInline muted />
      <p>Status: {status}</p>
      {error && <p>Error: {error}</p>}
    </div>
  );
}

// 사용
<WHEPPlayer streamUrl="http://192.168.10.181:8117/CCTV-001/whep" />;
```

### CCTVPlayer (Headless)

프로토콜 구분 없이 통일된 인터페이스로 사용:

```tsx
import { CCTVPlayer } from "@pf-dev/cctv";

function CustomPlayer() {
  return (
    <CCTVPlayer streamUrl="http://192.168.10.181:8120/CCTV-001/index.m3u8" protocol="hls">
      {({ videoRef, status, error, connect, disconnect }) => (
        <div className="player-container">
          <video ref={videoRef} autoPlay playsInline muted />

          {status === "connecting" && <div className="spinner" />}
          {status === "failed" && (
            <div className="error">
              <p>{error}</p>
              <button onClick={connect}>재연결</button>
            </div>
          )}

          <button onClick={disconnect}>연결 해제</button>
        </div>
      )}
    </CCTVPlayer>
  );
}
```

## 📖 상세 사용법

전체 API 문서와 사용 예시는 **[HOW_TO_USE.md](./HOW_TO_USE.md)**를 참고하세요.

- [프로토콜별 상세 설명](./HOW_TO_USE.md#프로토콜별-상세-설명)
- [CCTVPlayer Props & Render Props](./HOW_TO_USE.md#cctvplayer-headless-컴포넌트)
- [설정 옵션 (HLSConfig, WHEPConfig)](./HOW_TO_USE.md#설정-옵션)
- [프로토콜 비교 및 선택 가이드](./HOW_TO_USE.md#프로토콜-비교)

## 🔧 개발

```bash
# 설치
pnpm install

# 개발 모드
pnpm dev

# 빌드
pnpm build

# 타입 체크
pnpm type-check

# Lint
pnpm lint
```

## 📝 라이선스

MIT
