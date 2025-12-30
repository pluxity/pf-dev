# @pf-dev/services

공통 서비스 로직 패키지입니다.

## 설치

```bash
pnpm add @pf-dev/services
```

## 모듈

### Auth

인증 관련 타입을 제공합니다.

```typescript
import type { User, AuthState, LoginCredentials, LoginResponse } from "@pf-dev/services/auth";
```

## Roadmap

- [ ] useAuth, useLogin, useLogout 훅 구현
- [ ] AuthProvider 컴포넌트 구현
- [ ] ProtectedRouter 컴포넌트 구현

## 개발

```bash
# 타입 체크
pnpm type-check

# 린트
pnpm lint

# 포맷
pnpm format
```
