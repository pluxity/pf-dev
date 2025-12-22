# @pf-dev/map

## CesiumJS 기반 3D 지도 시각화 React 패키지

CesiumJS를 React 컴포넌트로 쉽게 사용할 수 있는 패키지입니다.

## ✨ 주요 기능

- 🗺️ **지도 표시**: MapViewer, Imagery, Terrain, Tiles3D
- 📷 **카메라 제어**: flyTo, lookAt, zoomTo (즉시/애니메이션 이동)
- 📍 **Entity 관리**: Feature 추가/삭제/수정/검색 (레이어 지원)
- 🎨 **상태별 효과**: Silhouette, Ripple, Glow, Outline
- 💾 **상태 관리**: Zustand 기반 Map/Camera/Feature Store
- 🌏 **다양한 Provider**: OSM, VWorld, Cesium Ion, Bing, ArcGIS

## 📦 설치

```bash
pnpm add @pf-dev/map cesium
```

## 🚀 빠른 시작

### 기본 지도

```tsx
import { MapViewer, Imagery, Terrain } from "@pf-dev/map";

function App() {
  return (
    <MapViewer className="w-full h-screen">
      <Imagery provider="osm" />
      <Terrain provider="ellipsoid" />
    </MapViewer>
  );
}
```

### 한국 지도 (VWorld)

```tsx
<MapViewer className="w-full h-screen">
  <Imagery provider="vworld" apiKey={import.meta.env.VITE_VWORLD_API_KEY} vworldLayer="Satellite" />
  <Terrain provider="ellipsoid" />
</MapViewer>
```

### Feature 추가

```tsx
import { useFeatureStore } from "@pf-dev/map";
import { Color, HeightReference } from "cesium";

function Map() {
  const { addFeature } = useFeatureStore();

  useEffect(() => {
    addFeature("sensor-001", {
      position: { longitude: 127.0, latitude: 37.5, height: 0 },
      properties: { type: "temperature", status: "active" },
      visual: {
        type: "billboard",
        image: "/icons/sensor.png",
        width: 32,
        height: 32,
        heightReference: HeightReference.CLAMP_TO_GROUND,
      },
      meta: {
        layerName: "sensors",
        tags: ["iot", "temperature"],
      },
    });
  }, []);

  return (
    <MapViewer>
      <Imagery provider="osm" />
    </MapViewer>
  );
}
```

## 📖 상세 사용법

전체 API 문서와 사용 예시는 **[HOW_TO_USE.md](./HOW_TO_USE.md)**를 참고하세요.

- [컴포넌트 상세 사용법](./HOW_TO_USE.md#컴포넌트-상세)
- [카메라 제어 API](./HOW_TO_USE.md#카메라-제어-usecamerastore)
- [Entity 관리 API](./HOW_TO_USE.md#entity-관리-usefeaturestore)
- [Feature 상태 효과](./HOW_TO_USE.md#featurestateeffects-상태별-시각-효과)
- [타입 정의 및 Exports](./HOW_TO_USE.md#타입-정의)

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
