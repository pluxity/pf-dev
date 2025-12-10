# @pf-dev/map

CesiumJS 기반 3D 지도 시각화 React 패키지입니다.

## 설치

```bash
pnpm add @pf-dev/map cesium
```

## 주요 기능

- **MapViewer** - Cesium Viewer React 컴포넌트
- **Imagery** - Ion, OSM, Bing, ArcGIS, VWorld, Kakao 이미지리 지원
- **Terrain** - Ellipsoid, Ion, Custom 터레인 지원
- **Tiles3D** - 3D Tiles 로딩 컴포넌트
- **Feature Store** - 그룹 기반 Entity 관리 및 검색
- **Map Store** - 카메라 제어 (flyTo, lookAt, setView)

## 기본 사용법

### 1. MapViewer 설정

```tsx
import { MapViewer, Imagery, Terrain, Tiles3D } from "@pf-dev/map";

function App() {
  return (
    <MapViewer className="w-full h-screen" ionToken={import.meta.env.VITE_ION_TOKEN}>
      <Imagery provider="osm" />
      <Terrain provider="ellipsoid" />
      <Tiles3D ionAssetId={12345} />
    </MapViewer>
  );
}
```

### 2. Imagery 옵션

```tsx
// OpenStreetMap
<Imagery provider="osm" />

// Cesium Ion
<Imagery provider="ion" assetId={2} />

// Bing Maps
<Imagery provider="bing" apiKey="YOUR_BING_KEY" />

// ArcGIS
<Imagery provider="arcgis" />

// VWorld (한국)
<Imagery provider="vworld" apiKey="YOUR_VWORLD_KEY" vworldLayer="Base" />

// Kakao (한국)
<Imagery provider="kakao" />
```

### 3. Terrain 옵션

```tsx
// 평면 지구 (기본값, Ion 불필요)
<Terrain provider="ellipsoid" />

// Cesium Ion Terrain
<Terrain provider="ion" assetId={1} />

// 커스텀 Terrain 서버
<Terrain provider="custom" url="https://your-terrain-server.com/tiles" />
```

### 4. 3D Tiles

```tsx
// URL로 로드
<Tiles3D url="/path/to/tileset.json" />

// Ion Asset으로 로드
<Tiles3D
  ionAssetId={12345}
  show={true}
  onReady={(tileset) => console.log("Loaded:", tileset)}
  onError={(error) => console.error("Error:", error)}
/>
```

### 5. Camera 제어

```tsx
import { useMapStore } from "@pf-dev/map";

function CameraControls() {
  const { flyTo, lookAt, setView, cameraPosition } = useMapStore();

  const handleFlyTo = () => {
    flyTo({
      longitude: 127.1,
      latitude: 37.5,
      height: 1000,
      duration: 2,
    });
  };

  const handleLookAt = () => {
    lookAt({
      longitude: 127.1,
      latitude: 37.5,
      height: 100,
      distance: 500,
      pitch: -45,
    });
  };

  const handleSetView = () => {
    setView({
      longitude: 127.1,
      latitude: 37.5,
      height: 1000,
      heading: 0,
      pitch: -90,
    });
  };

  return (
    <div>
      <button onClick={handleFlyTo}>Fly To</button>
      <button onClick={handleLookAt}>Look At</button>
      <button onClick={handleSetView}>Set View</button>
      <p>Current: {JSON.stringify(cameraPosition)}</p>
    </div>
  );
}
```

### 6. Feature Store 사용

Feature Store는 그룹 기반으로 Entity를 관리합니다.

```tsx
import { useFeatureStore } from "@pf-dev/map";

function FeatureManager() {
  const { addFeature, removeFeature, getFeature, findByProperty, clearGroup } = useFeatureStore();

  // Feature 추가 (Entity 반환)
  const entity = addFeature("sensors", "sensor-001", {
    position: { longitude: 127.1, latitude: 37.5, height: 0 },
    properties: { type: "temperature", status: "active", value: 25.5 },
  });

  // 반환된 Entity에 스타일 적용 (앱에서 직접)
  if (entity) {
    entity.billboard = {
      image: "/icons/sensor.png",
      width: 32,
      height: 32,
    };
  }

  // ID로 Feature 조회
  const feature = getFeature("sensors", "sensor-001");

  // Property로 검색 (객체 매칭)
  const activeFeatures = findByProperty("sensors", { status: "active" });

  // Property로 검색 (함수 필터)
  const hotSensors = findByProperty("sensors", (props) => (props.value as number) > 30);

  // Feature 삭제
  removeFeature("sensors", "sensor-001");

  // 그룹 전체 삭제
  clearGroup("sensors");
}
```

#### Feature Store API

| 메서드                                      | 설명                       |
| ------------------------------------------- | -------------------------- |
| `addFeature(groupId, featureId, options)`   | Feature 추가 → Entity 반환 |
| `removeFeature(groupId, featureId)`         | Feature 삭제               |
| `getFeature(groupId, featureId)`            | ID로 조회                  |
| `hasFeature(groupId, featureId)`            | 존재 여부                  |
| `updatePosition(groupId, featureId, coord)` | 위치 업데이트              |
| `findByProperty(groupId, filter)`           | 그룹 내 속성 검색          |
| `findAllByProperty(filter)`                 | 전체 속성 검색             |
| `getGroup(groupId)`                         | 그룹 조회                  |
| `clearGroup(groupId)`                       | 그룹 내 Feature 제거       |
| `removeGroup(groupId)`                      | 그룹 삭제                  |
| `getGroupIds()`                             | 그룹 ID 목록               |
| `getFeatureCount(groupId?)`                 | Feature 개수               |
| `clearAll()`                                | 전체 삭제                  |

## 타입 정의

```typescript
// 좌표
interface Coordinate {
  longitude: number;
  latitude: number;
  height?: number;
}

// Feature 옵션
interface FeatureOptions {
  position: Coordinate;
  properties?: Record<string, unknown>;
}

// Property 필터
type PropertyFilter = Record<string, unknown> | ((properties: Record<string, unknown>) => boolean);

// Camera
interface FlyToOptions {
  longitude: number;
  latitude: number;
  height?: number;
  heading?: number;
  pitch?: number;
  duration?: number;
}

interface LookAtOptions {
  longitude: number;
  latitude: number;
  height?: number;
  distance?: number;
  heading?: number;
  pitch?: number;
  duration?: number;
}
```

## License

MIT
