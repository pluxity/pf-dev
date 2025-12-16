# @pf-dev/three

React Three Fiber 기반 3D 시각화 패키지

## 설치

```bash
pnpm install
```

## 주요 기능

- ✅ **모델 로딩**: GLTF/GLB, FBX 로더 hooks
- ✅ **모델 관리**: Zustand 기반 상태 관리
- ✅ **카메라 제어**: 카메라 설정 및 위치 저장/복원
- ✅ **Feature Domain**: Asset/Feature 아키텍처로 수천 개의 인스턴스 최적 렌더링
- ✅ **유틸리티 Hooks**: Traverse, Raycast, MeshFinder
- ✅ **순수 함수 Utils**: React 의존성 없는 헬퍼 함수
- ✅ **CSS2D 오버레이**: HTML 오버레이 지원
- ✅ **메시 인터랙션**: Hover 감지, 하이라이트, 메시 정보 표시

## 사용 방법

### 선언적 방식 (Components)

```typescript
import { Canvas } from '@react-three/fiber';
import { GLTFModel } from '@pf-dev/three';

function Scene() {
  return (
    <Canvas>
      <ambientLight intensity={0.5} />
      <GLTFModel
        url="/models/building.glb"
        modelId="building"
        position={[0, 0, 0]}
        onLoaded={(gltf) => console.log('Loaded', gltf)}
      />
    </Canvas>
  );
}
```

### 프로그래밍 방식

```typescript
import { GLTFModel, useMeshFinderAll, useFacilityStore } from '@pf-dev/three';

function Building({ url }) {
  const facilities = useFacilityStore((s) => s.facilities);
  const facility = facilities.get('building');

  const cctvs = useMeshFinderAll(facility?.object || null, (mesh) =>
    mesh.name.includes('CCTV')
  );

  useEffect(() => {
    if (facility?.status === 'loaded') {
      console.log('Found CCTVs:', cctvs.length);
    }
  }, [facility, cctvs]);

  return (
    <GLTFModel
      url={url}
      modelId="building"
      onLoaded={(gltf) => console.log('Facility loaded')}
    />
  );
}
```

### 순수 함수 (Canvas 외부)

```typescript
import { traverseModel, findMeshByName, disposeMesh } from "@pf-dev/three/utils";
import { GLTFLoader } from "three-stdlib";

async function analyzeModel(url: string) {
  const loader = new GLTFLoader();
  const gltf = await loader.loadAsync(url);

  // CCTV 위치 찾기
  const cctv = findMeshByName(gltf.scene, "CCTV_1");
  console.log("CCTV Position:", cctv?.position);

  // 정리
  disposeScene(gltf.scene);
}
```

### Store 활용

```typescript
import { useFacilityStore, useCameraStore } from '@pf-dev/three';

function FacilityManager() {
  const facilities = useFacilityStore((s) => s.getAllFacilities());
  const disposeFacility = useFacilityStore((s) => s.disposeFacility);

  const saveCamera = useCameraStore((s) => s.saveState);
  const restoreCamera = useCameraStore((s) => s.restoreState);

  return (
    <div>
      <h3>Loaded Facilities: {facilities.length}</h3>
      {facilities.map((facility) => (
        <div key={facility.id}>
          <span>{facility.id}</span>
          <button onClick={() => disposeFacility(facility.id)}>
            Dispose
          </button>
        </div>
      ))}

      <button onClick={() => saveCamera('view1')}>
        Save Camera State
      </button>
      <button onClick={() => restoreCamera('view1')}>
        Restore Camera State
      </button>
    </div>
  );
}
```

### Feature Domain (대량 인스턴스 렌더링)

Feature Domain은 동일한 3D 모델을 수천 개 인스턴스로 렌더링할 때 최적화된 아키텍처입니다.

**개념**:

- **Asset**: 3D 모델 파일 자체 (CCTV, Fan, AC 등 - 약 100개 이하)
- **Feature**: Asset의 인스턴스로 위치, 회전, 스케일 정보 포함 (수천 개 가능)
- **1:N 관계**: 하나의 Asset → 여러 Feature
- **GPU Instancing**: InstancedMesh를 사용해 동일 Asset의 모든 Feature를 단일 Draw Call로 렌더링

#### 1. Asset 등록

```typescript
import { useAssetStore } from "@pf-dev/three";

function AssetRegistry() {
  const addAsset = useAssetStore((s) => s.addAsset);

  useEffect(() => {
    // CCTV Asset 등록
    addAsset({
      id: "cctv-box",
      name: "CCTV Box Camera",
      type: "gltf",
      modelUrl: "/assets/features/CCTV_Box.glb",
      thumbnail: "/assets/thumbnails/cctv-box.png",
    });

    addAsset({
      id: "cctv-dome",
      name: "CCTV Dome Camera",
      type: "gltf",
      modelUrl: "/assets/features/CCTV_dome.glb",
    });

    addAsset({
      id: "cctv-ptz",
      name: "CCTV PTZ Camera",
      type: "gltf",
      modelUrl: "/assets/features/CCTV_PTZ.glb",
    });

    // 기타 설비 Asset 등록
    addAsset({
      id: "air-conditioner",
      name: "Air Conditioner",
      type: "gltf",
      modelUrl: "/assets/features/air_Conditioner.glb",
    });

    addAsset({
      id: "fan",
      name: "Ventilation Fan",
      type: "gltf",
      modelUrl: "/assets/features/Fan.glb",
    });
  }, [addAsset]);

  return null;
}
```

#### 2. Feature 추가

```typescript
import { useFeatureStore } from "@pf-dev/three";

function BuildingFeatures() {
  const addFeature = useFeatureStore((s) => s.addFeature);
  const addFeatures = useFeatureStore((s) => s.addFeatures);

  useEffect(() => {
    // 개별 Feature 추가
    addFeature({
      id: "cctv-entrance-01",
      assetId: "cctv-box",
      position: [10, 5, 20],
      rotation: [0, Math.PI / 4, 0],
      scale: 1,
      metadata: {
        location: "Main Entrance",
        ipAddress: "192.168.1.101",
      },
    });

    // 다수 Feature 일괄 추가
    const cctvFeatures = [
      {
        id: "cctv-hallway-01",
        assetId: "cctv-dome",
        position: [15, 3, 10],
        rotation: [0, 0, 0],
        scale: 0.8,
      },
      {
        id: "cctv-hallway-02",
        assetId: "cctv-dome",
        position: [25, 3, 10],
        rotation: [0, Math.PI, 0],
        scale: 0.8,
      },
      {
        id: "cctv-parking-01",
        assetId: "cctv-ptz",
        position: [30, 8, 5],
        rotation: [0, -Math.PI / 2, 0],
        scale: 1.2,
      },
    ];

    addFeatures(cctvFeatures);

    // 에어컨 Features
    const acFeatures = Array.from({ length: 20 }, (_, i) => ({
      id: `ac-${i}`,
      assetId: "air-conditioner",
      position: [i * 5, 3, 0] as [number, number, number],
      rotation: [0, 0, 0] as [number, number, number],
      scale: 1,
    }));

    addFeatures(acFeatures);
  }, [addFeature, addFeatures]);

  return null;
}
```

#### 3. Feature 렌더링

```typescript
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { FeatureRenderer, useAssetLoader } from '@pf-dev/three';

function Scene() {
  const assets = useAssetStore((s) => Array.from(s.assets.values()));

  // Asset 모델 로드
  useAssetLoader(assets);

  return (
    <Canvas>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />

      {/* 건물 모델 */}
      <GLTFModel url="/models/building.glb" />

      {/* Feature 인스턴스 렌더링 (GPU Instancing) */}
      <FeatureRenderer />

      <OrbitControls />
    </Canvas>
  );
}

function App() {
  return (
    <>
      <AssetRegistry />
      <BuildingFeatures />
      <Scene />
    </>
  );
}
```

#### 4. Feature 관리

```typescript
import { useFeatureStore, useAssetStore } from '@pf-dev/three';

function FeatureManager() {
  const features = useFeatureStore((s) => s.getAllFeatures());
  const removeFeature = useFeatureStore((s) => s.removeFeature);
  const updateFeature = useFeatureStore((s) => s.updateFeature);
  const getFeaturesByAsset = useFeatureStore((s) => s.getFeaturesByAsset);

  // Asset별 Feature 개수
  const cctvBoxFeatures = getFeaturesByAsset('cctv-box');
  const cctvDomeFeatures = getFeaturesByAsset('cctv-dome');

  // Feature 위치 업데이트
  const moveFeature = (featureId: string, newPosition: [number, number, number]) => {
    updateFeature(featureId, { position: newPosition });
  };

  // Feature 표시/숨김
  const toggleFeatureVisibility = (featureId: string) => {
    const feature = features.find(f => f.id === featureId);
    if (feature) {
      updateFeature(featureId, { visible: !feature.visible });
    }
  };

  return (
    <div>
      <h3>Features: {features.length}</h3>
      <p>CCTV Box: {cctvBoxFeatures.length}</p>
      <p>CCTV Dome: {cctvDomeFeatures.length}</p>

      {features.map((feature) => (
        <div key={feature.id}>
          <span>{feature.id}</span>
          <button onClick={() => toggleFeatureVisibility(feature.id)}>
            Toggle
          </button>
          <button onClick={() => removeFeature(feature.id)}>
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}
```

#### 성능 특징

- **GPU Instancing**: 동일한 Asset의 모든 Feature를 단일 Draw Call로 렌더링
- **메모리 효율**: Geometry와 Material은 Asset당 1회만 로드
- **대규모 지원**: 수천 개의 Feature를 60fps로 렌더링 가능
- **동적 업데이트**: Feature 위치/회전/스케일 실시간 변경 가능

#### 사용 가능한 Asset 파일

`public/assets/features/` 경로:

- `CCTV_Box.glb` - 박스형 CCTV
- `CCTV_dome.glb` - 돔형 CCTV
- `CCTV_PTZ.glb` - PTZ CCTV
- `air_Conditioner.glb` - 에어컨
- `Fan.glb` - 환풍기

### 메시 인터랙션

**Hover Target 선택** - Facility, Feature, 또는 모두에 대해 Hover를 활성화할 수 있습니다.

```typescript
import { useMeshHover, MeshOutline, MeshInfo, useInteractionStore, useFacilityStore } from '@pf-dev/three';

function InteractiveScene() {
  const facility = useFacilityStore((s) => s.getFacility('building'));
  const hoverTarget = useInteractionStore((s) => s.hoverTarget);
  const setHoverTarget = useInteractionStore((s) => s.setHoverTarget);
  const meshInfo = useInteractionStore((s) => s.getHoveredMeshInfo());

  // Hover 대상 설정
  const hoverConfig = {
    facility: {
      targets: facility?.object ? [facility.object] : null,
      filter: undefined,
    },
    feature: {
      targets: null, // 모든 객체 검사
      filter: (obj: THREE.Object3D) => obj.userData?.isFeatureGroup === true,
    },
    all: {
      targets: null,
      filter: undefined,
    },
  }[hoverTarget];

  useMeshHover(hoverConfig.targets, {
    enabled: true,
    recursive: true,
    filter: hoverConfig.filter,
  });

  return (
    <>
      <Canvas>
        {facility?.object && <primitive object={facility.object} />}

        {/* Feature 렌더링 */}
        <FeatureRenderer />

        {/* 호버된 메시에 아웃라인 효과 */}
        {/* Feature: 녹색 아웃라인, Facility: Material 색상 변경 */}
        <MeshOutline />
      </Canvas>

      {/* Hover 대상 선택 */}
      <div>
        <button onClick={() => setHoverTarget('facility')}>Facility만</button>
        <button onClick={() => setHoverTarget('feature')}>Feature만</button>
        <button onClick={() => setHoverTarget('all')}>모두</button>
      </div>

      {/* 메시 정보 표시 */}
      {meshInfo && (
        <div className="mesh-info">
          <div>Name: {meshInfo.name}</div>
          <div>Position: {meshInfo.position.join(', ')}</div>
          <div>Vertices: {meshInfo.vertices}</div>
          <div>Triangles: {meshInfo.triangles}</div>
        </div>
      )}
    </>
  );
}
```

**아웃라인 색상 및 두께 커스터마이징**:

```typescript
const { setOutlineColor, setOutlineThickness } = useInteractionStore();

// 아웃라인 색상 변경 (Feature hover 시 적용)
setOutlineColor("#ff0000"); // 빨간색

// 아웃라인 두께 변경
setOutlineThickness(3);
```

**Hover 효과**:

- **Feature (InstancedMesh)**: 개별 인스턴스에 EdgesGeometry를 사용한 아웃라인 렌더링
- **Facility (일반 Mesh)**: Material의 color와 emissive 속성을 변경하여 하이라이트

## API 참조

### Components

- `<GLTFModel />` - GLTF/GLB 모델 컴포넌트
- `<FBXModel />` - FBX 모델 컴포넌트
- `<CSS2DOverlay />` - HTML 오버레이
- `<FeatureRenderer />` - Feature 인스턴스 렌더링 (GPU Instancing)
- `<MeshOutline />` - 호버된 메시 하이라이트
- `<MeshInfo />` - 메시 정보 표시

### Stores

- `useFacilityStore` - 건물/시설 상태 관리 (GLTF/FBX 모델)
- `useAssetStore` - 시설물 모델 파일 관리 (CCTV, Fan 등)
- `useFeatureStore` - 배치된 시설물 인스턴스 관리
- `useCameraStore` - 카메라 상태 관리
- `useInteractionStore` - 인터랙션 상태 관리

### Hooks

- `useModelTraverse(object, callback)` - 모델 순회
- `useRaycast(pointer, options)` - 레이캐스팅
- `useMeshFinder(object, predicate)` - Mesh 찾기
- `useMeshHover(targets, options)` - Mesh 호버 감지
- `useAssetLoader(assets)` - Asset 로딩

### Utils

- `traverseModel(object, callback)` - 모델 순회 (순수 함수)
- `disposeMesh(mesh)` - Mesh 메모리 정리
- `disposeScene(object)` - Scene 전체 정리
- `findMeshByName(object, name)` - 이름으로 Mesh 찾기
- `getMeshInfo(mesh)` - Mesh 정보 추출
- `computeBoundingBox(object)` - BoundingBox 계산
- `cloneMaterial(material)` - Material 복제

## 라이선스

MIT
